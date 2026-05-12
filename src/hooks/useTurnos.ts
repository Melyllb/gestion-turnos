import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { TurnoConDisponibilidad, FormularioTurno } from '../types';

export const useTurnos = () => {

  const [turnos, setTurnos] = useState<TurnoConDisponibilidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarTurnos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await api.get<TurnoConDisponibilidad[]>('/turnos/disponibilidad');
      data.sort((a, b) => {
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return a.horaInicio.localeCompare(b.horaInicio);
      });
      setTurnos(data);
    } catch {
      setError('Error al cargar los turnos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  const haySolapamiento = (datos: FormularioTurno, idExcluir?: number): boolean => {
    return turnos.some((turno) => {
      if (turno.id === idExcluir) return false;
      if (turno.fecha !== datos.fecha) return false;
      if (turno.estado !== 'activo') return false;
      const nuevoEmpieza = datos.horaInicio;
      const nuevoTermina = datos.horaFin;
      const existenteEmpieza = turno.horaInicio;
      const existenteTermina = turno.horaFin;
      return nuevoEmpieza < existenteTermina && nuevoTermina > existenteEmpieza;
    });
  };

  const validarFormulario = (datos: FormularioTurno, idExcluir?: number): string | null => {
    if (!datos.fecha) return 'La fecha es obligatoria';
    if (!datos.horaInicio) return 'La hora de inicio es obligatoria';
    if (!datos.horaFin) return 'La hora de fin es obligatoria';
    if (datos.capacidadMaxima <= 0) return 'La capacidad debe ser mayor a 0';

    if (datos.horaInicio >= datos.horaFin) {
      return 'La hora de inicio debe ser anterior a la hora de fin';
    }

    if (haySolapamiento(datos, idExcluir)) {
      return `Ya existe un turno el ${datos.fecha} entre ${datos.horaInicio} y ${datos.horaFin}`;
    }

    return null;
  };

  const crearTurno = async (datos: FormularioTurno): Promise<number> => {
    const errorValidacion = validarFormulario(datos);
    if (errorValidacion) throw new Error(errorValidacion);

    const turno = await api.post<{ id: number }>('/turnos', datos);
    await cargarTurnos();
    return turno.id;
  };

  const editarTurno = async (id: number, datos: Partial<FormularioTurno>): Promise<void> => {
    const turnoActual = turnos.find((t) => t.id === id);
    if (!turnoActual) throw new Error('Turno no encontrado');

    if (datos.capacidadMaxima !== undefined && datos.capacidadMaxima < turnoActual.reservasConfirmadas) {
      throw new Error(`La capacidad no puede ser menor a las ${turnoActual.reservasConfirmadas} reservas confirmadas`);
    }

    const datosMerge: FormularioTurno = {
      fecha: datos.fecha ?? turnoActual.fecha,
      horaInicio: datos.horaInicio ?? turnoActual.horaInicio,
      horaFin: datos.horaFin ?? turnoActual.horaFin,
      capacidadMaxima: datos.capacidadMaxima ?? turnoActual.capacidadMaxima,
    };

    const errorValidacion = validarFormulario(datosMerge, id);
    if (errorValidacion) throw new Error(errorValidacion);

    await api.put(`/turnos/${id}`, datos);
    await cargarTurnos();
  };

  const eliminarTurno = async (id: number): Promise<void> => {
    await api.delete(`/turnos/${id}`);
    await cargarTurnos();
  };

  const cambiarEstado = async (id: number, estado: 'activo' | 'inactivo'): Promise<void> => {
    if (estado === 'inactivo') {
      await api.delete(`/turnos/${id}`);
    } else {
      await api.patch(`/turnos/${id}/toggle`);
    }
    await cargarTurnos();
  };

  const getDisponibilidad = (turnoId: number): number => {
    const turno = turnos.find((t) => t.id === turnoId);
    return turno ? turno.cuposDisponibles : 0;
  };

  return {
    turnos,
    cargando,
    error,
    crearTurno,
    editarTurno,
    eliminarTurno,
    cambiarEstado,
    getDisponibilidad,
    recargar: cargarTurnos,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import type { TurnoConDisponibilidad, FormularioTurno } from '../types';

export const useTurnos = () => {

  const [turnos, setTurnos] = useState<TurnoConDisponibilidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = useStorage();
  const cargarTurnos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await storage.getTurnosConDisponibilidad();
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
      // Si es el mismo turno que estamos editando, lo saltamos
      if (turno.id === idExcluir) return false;

      // Solo comparamos turnos de la misma fecha
      if (turno.fecha !== datos.fecha) return false;

      // Solo comparamos contra turnos activos
      if (turno.estado !== 'activo') return false;

      // Comprobación de intersección de rangos horarios
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

    const id = await storage.addTurno(datos);
    await cargarTurnos();
    return id;
  };

  const editarTurno = async (id: number, datos: Partial<FormularioTurno>): Promise<void> => {
    // Para validar solapamiento necesitamos los datos completos.
    // Mezclamos los datos actuales del turno con los nuevos.
    const turnoActual = turnos.find((t) => t.id === id);
    if (!turnoActual) throw new Error('Turno no encontrado');

    // Validar que la capacidad no sea menor a las reservas confirmadas
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

    await storage.updateTurno(id, datos);
    await cargarTurnos();
  };

  const eliminarTurno = async (id: number): Promise<void> => {
    await storage.deleteTurno(id);
    await cargarTurnos();
  };

  const cambiarEstado = async (id: number, estado: 'activo' | 'inactivo'): Promise<void> => {
    await storage.toggleTurnoEstado(id, estado);
    await cargarTurnos();
  };

  const getDisponibilidad = (turnoId: number): number => {
    const turno = turnos.find((t) => t.id === turnoId);
    return turno ? turno.cuposDisponibles : 0;
  };

  return {
    // Estado
    turnos,
    cargando,
    error,

    // Acciones CRUD
    crearTurno,
    editarTurno,
    eliminarTurno,
    cambiarEstado,

    // Utilidades
    getDisponibilidad,
    recargar: cargarTurnos,
  };
};
import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import type { TurnoConDisponibilidad, FormularioTurno } from '../types';

export const useTurnos = () => {

  const [turnos, setTurnos] = useState<TurnoConDisponibilidad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = useStorage();

  // ============================================================
  // CARGA DE TURNOS
  // useCallback evita que cargarTurnos se recree en cada render,
  // lo que causaría un loop infinito al usarla dentro del useEffect.
  // ============================================================
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

  // Carga inicial al montar el hook
  useEffect(() => {
    cargarTurnos();
  }, [cargarTurnos]);

  // ============================================================
  // VALIDACIÓN DE SOLAPAMIENTO HORARIO
  // Dos turnos se solapan si comparten la misma fecha y sus
  // rangos horarios se intersectan. La intersección ocurre cuando:
  //   nuevo.horaInicio < existente.horaFin
  //   Y
  //   nuevo.horaFin > existente.horaInicio
  //
  // El parámetro idExcluir se usa al editar: evita que un turno
  // colisione consigo mismo al compararse.
  // ============================================================
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

  // ============================================================
  // VALIDACIONES GENERALES DEL FORMULARIO
  // Centraliza todas las validaciones de negocio antes de
  // tocar la base de datos. Retorna un string con el error
  // o null si todo está bien.
  // ============================================================
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

  // ============================================================
  // CREAR TURNO
  // Valida primero, luego persiste y recarga el estado.
  // Lanza un Error con mensaje legible para que el componente
  // que llama pueda mostrarlo al usuario.
  // ============================================================
  const crearTurno = async (datos: FormularioTurno): Promise<number> => {
    const errorValidacion = validarFormulario(datos);
    if (errorValidacion) throw new Error(errorValidacion);

    const id = await storage.addTurno(datos);
    await cargarTurnos();
    return id;
  };

  // ============================================================
  // EDITAR TURNO
  // Pasa el id actual como idExcluir para que el turno no
  // colisione consigo mismo durante la validación de solapamiento.
  // ============================================================
  const editarTurno = async (id: number, datos: Partial<FormularioTurno>): Promise<void> => {
    // Para validar solapamiento necesitamos los datos completos.
    // Mezclamos los datos actuales del turno con los nuevos.
    const turnoActual = turnos.find((t) => t.id === id);
    if (!turnoActual) throw new Error('Turno no encontrado');

    const datosMerge: FormularioTurno = {
      fecha: datos.fecha ?? turnoActual.fecha,
      horaInicio: datos.horaInicio ?? turnoActual.horaInicio,
      horaFin: datos.horaFin ?? turnoActual.horaFin,
      capacidadMaxima: datos.capacidadMaxima ?? turnoActual.capacidadMaxima,
      estado: datos.estado ?? turnoActual.estado,
    };

    const errorValidacion = validarFormulario(datosMerge, id);
    if (errorValidacion) throw new Error(errorValidacion);

    await storage.updateTurno(id, datos);
    await cargarTurnos();
  };

  // ============================================================
  // ELIMINAR TURNO
  // useStorage ya valida que no haya reservas asociadas.
  // Aquí solo propagamos el error si lo hay.
  // ============================================================
  const eliminarTurno = async (id: number): Promise<void> => {
    await storage.deleteTurno(id);
    await cargarTurnos();
  };

  // ============================================================
  // CAMBIAR ESTADO (activar / desactivar)
  // Permite desactivar un turno sin eliminarlo, conservando
  // el historial de reservas asociadas.
  // ============================================================
  const cambiarEstado = async (id: number, estado: 'activo' | 'inactivo'): Promise<void> => {
    await storage.toggleTurnoEstado(id, estado);
    await cargarTurnos();
  };

  // ============================================================
  // DISPONIBILIDAD CALCULADA
  // Los turnos ya vienen con cuposDisponibles desde
  // getTurnosConDisponibilidad(), pero exponemos también una
  // función puntual para consultar un turno específico.
  // ============================================================
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
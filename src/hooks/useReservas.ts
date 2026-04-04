import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import type { FormularioReserva,ReservaConTurno } from '../types';



export const useReservas = () => {

  const [reservas, setReservas] = useState<ReservaConTurno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storage = useStorage();

  // ============================================================
  // CARGA DE RESERVAS CON DATOS DEL TURNO
  // getReservasConTurno() hace un join manual en IndexedDB:
  // por cada reserva busca su turno asociado y lo incrusta.
  // useCallback evita el loop infinito en el useEffect.
  // ============================================================
  const cargarReservas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await storage.getReservasConTurno();
      // Ordenar: confirmadas primero, luego por fecha de reserva descendente
      const ordenadas = data.sort((a, b) => {
        if (a.estado === b.estado) {
          return new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime();
        }
        return a.estado === 'confirmada' ? -1 : 1;
      });
      setReservas(ordenadas as ReservaConTurno[]);
    } catch {
      setError('Error al cargar las reservas');
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial al montar el hook
  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  // ============================================================
  // CREAR RESERVA
  // La verificación de cupo ya está implementada en useStorage,
  // pero aquí añadimos una verificación previa optimista usando
  // el estado local de reservas, para dar feedback más rápido
  // sin necesidad de ir a IndexedDB primero.
  //
  // Flujo:
  //   1. Verificación optimista con estado local
  //   2. Llamada a storage.addReserva() que hace la verificación
  //      definitiva contra IndexedDB (fuente de verdad)
  //   3. Recarga del estado
  // ============================================================
  const crearReserva = async (
    turnoId: number,
    datos: FormularioReserva
  ): Promise<number> => {

    // Validaciones del formulario
    if (!datos.nombreCliente.trim()) {
      throw new Error('El nombre del cliente es obligatorio');
    }
    if (!datos.carnetIdentidad.trim()) {
      throw new Error('El carnet de identidad es obligatorio');
    }

    // Verificación optimista: contar reservas confirmadas locales
    // para dar un error rápido sin esperar a IndexedDB
    const reservasConfirmadasLocales = reservas.filter(
      (r) => r.turnoId === turnoId && r.estado === 'confirmada'
    ).length;

    if (reservasConfirmadasLocales > 0) {
      // Verificamos también si el cliente ya tiene una reserva en este turno
      const yaReservado = reservas.some(
        (r) =>
          r.turnoId === turnoId &&
          r.carnetIdentidad === datos.carnetIdentidad.trim() &&
          r.estado === 'confirmada'
      );
      if (yaReservado) {
        throw new Error('Este cliente ya tiene una reserva confirmada en este turno');
      }
    }

    // Llamada definitiva a la capa de datos
    // storage.addReserva verifica: turno activo, cupo disponible,
    // duplicado por carnet — es la fuente de verdad final.
    const id = await storage.addReserva({
      ...datos,
      nombreCliente: datos.nombreCliente.trim(),
      carnetIdentidad: datos.carnetIdentidad.trim(),
      turnoId,
    });

    await cargarReservas();
    return id;
  };

  // ============================================================
  // CANCELAR RESERVA
  // Cambia el estado de 'confirmada' a 'cancelada'.
  // No elimina el registro, conserva el historial.
  // useStorage valida que la reserva exista y no esté ya cancelada.
  // ============================================================
  const cancelarReserva = async (id: number): Promise<void> => {
    const reserva = reservas.find((r) => r.id === id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    if (reserva.estado === 'cancelada') {
      throw new Error('La reserva ya está cancelada');
    }

    await storage.cancelReserva(id);
    await cargarReservas();
  };

  // ============================================================
  // OBTENER RESERVAS POR TURNO
  // Filtra del estado local sin ir a IndexedDB.
  // Útil para mostrar las reservas de un turno específico
  // en el panel de administración o en el modal de detalle.
  // ============================================================
  const getReservasPorTurno = (turnoId: number): ReservaConTurno[] => {
    return reservas.filter((r) => r.turnoId === turnoId);
  };

  // ============================================================
  // OBTENER RESERVAS POR CLIENTE
  // Filtra por carnet de identidad, útil para verificar
  // si un cliente ya tiene reservas activas.
  // ============================================================
  const getReservasPorCliente = (carnetIdentidad: string): ReservaConTurno[] => {
    return reservas.filter((r) => r.carnetIdentidad === carnetIdentidad.trim());
  };

  // ============================================================
  // ESTADÍSTICAS DERIVADAS DEL ESTADO LOCAL
  // Se calculan sin ir a IndexedDB, directamente del estado.
  // ============================================================
  const estadisticas = {
    total: reservas.length,
    confirmadas: reservas.filter((r) => r.estado === 'confirmada').length,
    canceladas: reservas.filter((r) => r.estado === 'cancelada').length,
  };

  return {
    // Estado
    reservas,
    cargando,
    error,
    estadisticas,

    // Acciones
    crearReserva,
    cancelarReserva,

    // Consultas
    getReservasPorTurno,
    getReservasPorCliente,

    // Utilidad
    recargar: cargarReservas,
  };
};
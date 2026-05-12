import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import type { FormularioReserva, ReservaConTurno } from '../types';

export const useReservas = () => {

  const [reservas, setReservas] = useState<ReservaConTurno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarReservas = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await api.get<ReservaConTurno[]>('/reservas');
      const ordenadas = data.sort((a, b) => {
        if (a.estado === b.estado) {
          return new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime();
        }
        return a.estado === 'confirmada' ? -1 : 1;
      });
      setReservas(ordenadas);
    } catch {
      setError('Error al cargar las reservas');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarReservas();
  }, [cargarReservas]);

  const crearReserva = async (
    turnoId: number,
    datos: FormularioReserva
  ): Promise<number> => {
    if (!datos.nombreCliente.trim()) {
      throw new Error('El nombre del cliente es obligatorio');
    }
    if (!datos.carnetIdentidad.trim()) {
      throw new Error('El carnet de identidad es obligatorio');
    }

    const reservasConfirmadasLocales = reservas.filter(
      (r) => r.turnoId === turnoId && r.estado === 'confirmada'
    ).length;

    if (reservasConfirmadasLocales > 0) {
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

    const reserva = await api.post<{ id: number }>('/reservas', {
      ...datos,
      nombreCliente: datos.nombreCliente.trim(),
      carnetIdentidad: datos.carnetIdentidad.trim(),
      turnoId,
    });

    await cargarReservas();
    return reserva.id;
  };

  const cancelarReserva = async (id: number): Promise<void> => {
    const reserva = reservas.find((r) => r.id === id);

    if (!reserva) {
      throw new Error('Reserva no encontrada');
    }
    if (reserva.estado === 'cancelada') {
      throw new Error('La reserva ya está cancelada');
    }

    await api.patch(`/reservas/${id}/cancelar`);
    await cargarReservas();
  };

  const getReservasPorTurno = (turnoId: number): ReservaConTurno[] => {
    return reservas.filter((r) => r.turnoId === turnoId);
  };

  const getReservasPorCliente = (carnetIdentidad: string): ReservaConTurno[] => {
    return reservas.filter((r) => r.carnetIdentidad === carnetIdentidad.trim());
  };

  const estadisticas = {
    total: reservas.length,
    confirmadas: reservas.filter((r) => r.estado === 'confirmada').length,
    canceladas: reservas.filter((r) => r.estado === 'cancelada').length,
  };

  return {
    reservas,
    cargando,
    error,
    estadisticas,
    crearReserva,
    cancelarReserva,
    getReservasPorTurno,
    getReservasPorCliente,
    recargar: cargarReservas,
  };
};

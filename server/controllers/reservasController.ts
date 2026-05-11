import { Request, Response } from 'express';
import { readDB, writeDB, Reserva, ReservaInput } from '../utils/fileStorage';

export const getReservas = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const reservasConTurno = db.reservas.map((reserva) => {
      const turno = db.turnos.find((t) => t.id === reserva.turnoId) ?? null;
      return {
        ...reserva,
        turno: turno
          ? { fecha: turno.fecha, horaInicio: turno.horaInicio, horaFin: turno.horaFin }
          : null,
      };
    });

    const ordenadas = reservasConTurno.sort((a, b) => {
      if (a.estado === b.estado) {
        return new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime();
      }
      return a.estado === 'confirmada' ? -1 : 1;
    });

    res.json(ordenadas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

export const getReservaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const reserva = db.reservas.find((r) => r.id === Number(req.params.id));
    if (!reserva) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    const turno = db.turnos.find((t) => t.id === reserva.turnoId) ?? null;
    res.json({
      ...reserva,
      turno: turno
        ? { fecha: turno.fecha, horaInicio: turno.horaInicio, horaFin: turno.horaFin }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva' });
  }
};

export const getReservasByTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const turnoId = Number(req.params.turnoId);
    const reservas = db.reservas.filter((r) => r.turnoId === turnoId);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
};

export const createReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const { turnoId, nombreCliente, carnetIdentidad } = req.body as ReservaInput;

    const turno = db.turnos.find((t) => t.id === turnoId);
    if (!turno) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }
    if (turno.estado !== 'activo') {
      res.status(400).json({ error: 'El turno no está activo' });
      return;
    }

    const reservasConfirmadas = db.reservas.filter(
      (r) => r.turnoId === turnoId && r.estado === 'confirmada'
    ).length;
    if (reservasConfirmadas >= turno.capacidadMaxima) {
      res.status(400).json({ error: 'No hay cupos disponibles para este turno' });
      return;
    }

    const yaReservado = db.reservas.some(
      (r) =>
        r.turnoId === turnoId &&
        r.carnetIdentidad === carnetIdentidad &&
        r.estado === 'confirmada'
    );
    if (yaReservado) {
      res.status(409).json({ error: 'Este cliente ya tiene una reserva confirmada en este turno' });
      return;
    }

    db.contadores.reservas++;
    const nuevaReserva: Reserva = {
      id: db.contadores.reservas,
      turnoId,
      nombreCliente,
      carnetIdentidad,
      fechaReserva: new Date().toISOString(),
      estado: 'confirmada',
    };

    db.reservas.push(nuevaReserva);
    await writeDB(db);

    res.status(201).json({
      ...nuevaReserva,
      turno: {
        fecha: turno.fecha,
        horaInicio: turno.horaInicio,
        horaFin: turno.horaFin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

export const cancelReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const id = Number(req.params.id);
    const reservaIndex = db.reservas.findIndex((r) => r.id === id);

    if (reservaIndex === -1) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    if (db.reservas[reservaIndex].estado === 'cancelada') {
      res.status(400).json({ error: 'La reserva ya está cancelada' });
      return;
    }

    db.reservas[reservaIndex].estado = 'cancelada';
    await writeDB(db);

    res.json({ mensaje: 'Reserva cancelada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
};

export const deleteReserva = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const id = Number(req.params.id);
    const reservaIndex = db.reservas.findIndex((r) => r.id === id);

    if (reservaIndex === -1) {
      res.status(404).json({ error: 'Reserva no encontrada' });
      return;
    }

    db.reservas.splice(reservaIndex, 1);
    await writeDB(db);

    res.json({ mensaje: 'Reserva eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};

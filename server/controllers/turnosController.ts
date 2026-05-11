import { Request, Response } from 'express';
import { readDB, writeDB, Turno, TurnoInput } from '../utils/fileStorage';

export const getTurnos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    res.json(db.turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
};

export const getTurnoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const turno = db.turnos.find((t) => t.id === Number(req.params.id));
    if (!turno) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }
    res.json(turno);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el turno' });
  }
};

export const getTurnosActivos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const activos = db.turnos.filter((t) => t.estado === 'activo');
    res.json(activos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los turnos activos' });
  }
};

export const createTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const { fecha, horaInicio, horaFin, capacidadMaxima } = req.body as TurnoInput;

    const existeDuplicado = db.turnos.some(
      (t) => t.fecha === fecha && t.horaInicio === horaInicio
    );
    if (existeDuplicado) {
      res.status(409).json({ error: 'Ya existe un turno con la misma fecha y hora de inicio' });
      return;
    }

    const haySolapamiento = db.turnos.some((t) => {
      if (t.fecha !== fecha || t.estado !== 'activo') return false;
      return horaInicio < t.horaFin && horaFin > t.horaInicio;
    });
    if (haySolapamiento) {
      res.status(409).json({ error: `Ya existe un turno el ${fecha} que se superpone con ese horario` });
      return;
    }

    db.contadores.turnos++;
    const nuevoTurno: Turno = {
      id: db.contadores.turnos,
      fecha,
      horaInicio,
      horaFin,
      capacidadMaxima,
      estado: 'activo',
    };

    db.turnos.push(nuevoTurno);
    await writeDB(db);

    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el turno' });
  }
};

export const updateTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const id = Number(req.params.id);
    const turnoIndex = db.turnos.findIndex((t) => t.id === id);

    if (turnoIndex === -1) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }

    const turnoActual = db.turnos[turnoIndex];
    const { fecha, horaInicio, horaFin, capacidadMaxima } = req.body as Partial<TurnoInput>;

    if (fecha !== undefined && !fecha) {
      res.status(400).json({ error: 'La fecha no puede estar vacía' });
      return;
    }

    if (capacidadMaxima !== undefined) {
      const reservasConfirmadas = db.reservas.filter(
        (r) => r.turnoId === id && r.estado === 'confirmada'
      ).length;
      if (capacidadMaxima < reservasConfirmadas) {
        res.status(400).json({ error: `La capacidad no puede ser menor a ${reservasConfirmadas} reservas confirmadas` });
        return;
      }
    }

    const fechaFinal = fecha ?? turnoActual.fecha;
    const horaInicioFinal = horaInicio ?? turnoActual.horaInicio;
    const horaFinFinal = horaFin ?? turnoActual.horaFin;

    const haySolapamiento = db.turnos.some((t) => {
      if (t.id === id) return false;
      if (t.fecha !== fechaFinal || t.estado !== 'activo') return false;
      return horaInicioFinal < t.horaFin && horaFinFinal > t.horaInicio;
    });
    if (haySolapamiento) {
      res.status(409).json({ error: `Ya existe un turno el ${fechaFinal} que se superpone con ese horario` });
      return;
    }

    db.turnos[turnoIndex] = {
      ...turnoActual,
      fecha: fechaFinal,
      horaInicio: horaInicioFinal,
      horaFin: horaFinFinal,
      capacidadMaxima: capacidadMaxima ?? turnoActual.capacidadMaxima,
    };

    await writeDB(db);
    res.json(db.turnos[turnoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el turno' });
  }
};

export const deleteTurno = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const id = Number(req.params.id);
    const turnoIndex = db.turnos.findIndex((t) => t.id === id);

    if (turnoIndex === -1) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }

    db.turnos[turnoIndex].estado = 'inactivo';
    await writeDB(db);

    res.json({ mensaje: 'Turno eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el turno' });
  }
};

export const toggleTurnoEstado = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const id = Number(req.params.id);
    const turnoIndex = db.turnos.findIndex((t) => t.id === id);

    if (turnoIndex === -1) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }

    const nuevoEstado = db.turnos[turnoIndex].estado === 'activo' ? 'inactivo' : 'activo';
    db.turnos[turnoIndex].estado = nuevoEstado;
    await writeDB(db);

    res.json(db.turnos[turnoIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar el estado del turno' });
  }
};

export const getTurnosConDisponibilidad = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();

    const turnosConInfo = db.turnos.map((turno) => {
      const reservasConfirmadas = db.reservas.filter(
        (r) => r.turnoId === turno.id && r.estado === 'confirmada'
      ).length;

      return {
        ...turno,
        reservasConfirmadas,
        cuposDisponibles: turno.capacidadMaxima - reservasConfirmadas,
      };
    });

    res.json(turnosConInfo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
};

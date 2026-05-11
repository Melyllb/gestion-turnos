import { Request, Response, NextFunction } from 'express';

export interface TurnoInput {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  capacidadMaxima: number;
}

export interface TurnoUpdateInput {
  fecha?: string;
  horaInicio?: string;
  horaFin?: string;
  capacidadMaxima?: number;
}

export const validateTurnoCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fecha, horaInicio, horaFin, capacidadMaxima } = req.body as TurnoInput;
  const errores: string[] = [];

  if (!fecha) {
    errores.push('La fecha es obligatoria');
  }

  if (!horaInicio) {
    errores.push('La hora de inicio es obligatoria');
  }

  if (!horaFin) {
    errores.push('La hora de fin es obligatoria');
  }

  if (capacidadMaxima === undefined || capacidadMaxima <= 0) {
    errores.push('La capacidad debe ser mayor a 0');
  }

  if (horaInicio && horaFin && horaInicio >= horaFin) {
    errores.push('La hora de inicio debe ser anterior a la hora de fin');
  }

  if (errores.length > 0) {
    res.status(400).json({ errores });
    return;
  }

  next();
};

export const validateTurnoUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fecha, horaInicio, horaFin, capacidadMaxima } = req.body as TurnoUpdateInput;
  const errores: string[] = [];

  if (fecha !== undefined && !fecha) {
    errores.push('La fecha no puede estar vacía');
  }

  if (horaInicio !== undefined && !horaInicio) {
    errores.push('La hora de inicio no puede estar vacía');
  }

  if (horaFin !== undefined && !horaFin) {
    errores.push('La hora de fin no puede estar vacía');
  }

  if (capacidadMaxima !== undefined && capacidadMaxima <= 0) {
    errores.push('La capacidad debe ser mayor a 0');
  }

  if (
    horaInicio !== undefined &&
    horaFin !== undefined &&
    horaInicio >= horaFin
  ) {
    errores.push('La hora de inicio debe ser anterior a la hora de fin');
  }

  if (errores.length > 0) {
    res.status(400).json({ errores });
    return;
  }

  next();
};

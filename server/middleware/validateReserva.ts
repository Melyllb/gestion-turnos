import { Request, Response, NextFunction } from 'express';

export interface ReservaInput {
  turnoId: number;
  nombreCliente: string;
  carnetIdentidad: string;
}

export const validateReservaCreate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { turnoId, nombreCliente, carnetIdentidad } = req.body as ReservaInput;
  const errores: string[] = [];

  if (!turnoId) {
    errores.push('El turno es obligatorio');
  }

  if (!nombreCliente?.trim()) {
    errores.push('El nombre del cliente es obligatorio');
  } else if (nombreCliente.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres');
  }

  if (!carnetIdentidad?.trim()) {
    errores.push('El carnet de identidad es obligatorio');
  } else if (carnetIdentidad.trim().length !== 11) {
    errores.push('El carnet debe tener 11 caracteres');
  }

  if (errores.length > 0) {
    res.status(400).json({ errores });
    return;
  }

  req.body.nombreCliente = nombreCliente.trim();
  req.body.carnetIdentidad = carnetIdentidad.trim();

  next();
};

import { Request, Response, NextFunction } from 'express';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body as LoginInput;
  const errores: string[] = [];

  if (!email) {
    errores.push('El email es obligatorio');
  } else if (!isValidEmail(email)) {
    errores.push('El formato del email es inválido');
  }

  if (!password) {
    errores.push('La contraseña es obligatoria');
  }

  if (errores.length > 0) {
    res.status(400).json({ errores });
    return;
  }

  next();
};

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { nombre, email, password } = req.body as RegisterInput;
  const errores: string[] = [];

  if (!nombre?.trim()) {
    errores.push('El nombre es obligatorio');
  }

  if (!email) {
    errores.push('El email es obligatorio');
  } else if (!isValidEmail(email)) {
    errores.push('El formato del email es inválido');
  }

  if (!password) {
    errores.push('La contraseña es obligatoria');
  } else if (password.length < 6) {
    errores.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (errores.length > 0) {
    res.status(400).json({ errores });
    return;
  }

  req.body.nombre = nombre.trim();
  req.body.email = email.toLowerCase().trim();

  next();
};

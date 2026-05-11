import { Request, Response } from 'express';
import { readDB, writeDB, Usuario } from '../utils/fileStorage';

export const getUsuarios = async (_req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const usuariosSinPassword = db.usuarios.map(({ password, ...rest }) => rest);
    res.json(usuariosSinPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

export const getUsuarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const usuario = db.usuarios.find((u) => u.id === Number(req.params.id));
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const { password, ...usuarioSinPassword } = usuario;
    res.json(usuarioSinPassword);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const { email, password } = req.body;

    const usuario = db.usuarios.find((u) => u.email === email.toLowerCase());
    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    if (usuario.password !== password) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const { password: _, ...usuarioSinPassword } = usuario;
    res.json({
      mensaje: 'Login exitoso',
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el login' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await readDB();
    const { nombre, email, password } = req.body;

    const existeEmail = db.usuarios.some((u) => u.email === email.toLowerCase());
    if (existeEmail) {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }

    db.contadores.usuarios++;
    const nuevoUsuario: Usuario = {
      id: db.contadores.usuarios,
      nombre,
      email,
      password,
    };

    db.usuarios.push(nuevoUsuario);
    await writeDB(db);

    const { password: _, ...usuarioSinPassword } = nuevoUsuario;
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: usuarioSinPassword,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

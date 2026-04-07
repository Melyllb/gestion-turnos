import { createContext, useState, useEffect } from 'react';
import type { Usuario, AuthContextType } from '../types';
import { db } from '../db/database';

const AuthContext = createContext<AuthContextType | null>(null);

const obtenerNombreDesdeEmail = (email: string): string => {
  return email.trim().split('@')[0] || '';
};

const normalizarUsuario = (usuario: Usuario): Usuario => ({
  ...usuario,
  nombre: usuario.nombre?.trim() || obtenerNombreDesdeEmail(usuario.email),
});

const recuperarSesion = (): Usuario | null => {
  try {
    const guardado = localStorage.getItem('bb_user');
    if (!guardado) return null;

    const usuario = JSON.parse(guardado) as Usuario;

    if (!usuario?.email) {
      localStorage.removeItem('bb_user');
      return null;
    }

    return normalizarUsuario(usuario);
  } catch {
    localStorage.removeItem('bb_user');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [user, setUser] = useState<Usuario | null>(recuperarSesion);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'bb_user') return;

      if (e.newValue === null) {
        setUser(null);
      } else {
        try {
          const usuario = JSON.parse(e.newValue) as Usuario;
          if (usuario?.email) setUser(normalizarUsuario(usuario));
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usuario = await db.usuarios
        .where('email')
        .equals(email.toLowerCase().trim())
        .first();

      if (!usuario) return false;
      if (usuario.password !== password) return false;

      const usuarioNormalizado = normalizarUsuario(usuario);

      setUser(usuarioNormalizado);
      localStorage.setItem('bb_user', JSON.stringify(usuarioNormalizado));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bb_user');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

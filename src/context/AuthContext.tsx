import { createContext, useState, useEffect } from 'react';
import type { Usuario, AuthContextType } from '../types';
import { useStorage } from '../hooks/useStorage';

const AuthContext = createContext<AuthContextType | null>(null);

// Función auxiliar que lee localStorage ANTES del primer render.
// Al pasarla como inicializador lazy de useState, React la ejecuta
// una sola vez y evita el useEffect + setState que causaba el warning.
const recuperarSesion = (): Usuario | null => {
  try {
    const guardado = localStorage.getItem('bb_user');
    return guardado ? (JSON.parse(guardado) as Usuario) : null;
  } catch {
    localStorage.removeItem('bb_user');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  // Inicialización lazy: recuperarSesion() se ejecuta solo una vez,
  // antes del primer render. Sin useEffect, sin cascading renders.
  const [user, setUser] = useState<Usuario | null>(recuperarSesion);

  const { loginUsuario } = useStorage();

  // Sincronización entre pestañas (este useEffect sí es correcto
  // porque solo suscribe a un evento externo, no llama setState
  // en el cuerpo del efecto sino en un callback)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'bb_user') return;
      if (e.newValue === null) {
        setUser(null);
      } else {
        try {
          setUser(JSON.parse(e.newValue) as Usuario);
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
      const usuario = await loginUsuario(email, password);
      if (usuario) {
        setUser(usuario);
        localStorage.setItem('bb_user', JSON.stringify(usuario));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bb_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
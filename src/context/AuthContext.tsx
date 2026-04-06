// import { createContext, useState, useEffect } from 'react';
// import type { Usuario, AuthContextType } from '../types';
// import { useStorage } from '../hooks/useStorage';

// const AuthContext = createContext<AuthContextType | null>(null);

// // Función auxiliar que lee localStorage ANTES del primer render.
// // Al pasarla como inicializador lazy de useState, React la ejecuta
// // una sola vez y evita el useEffect + setState que causaba el warning.
// const recuperarSesion = (): Usuario | null => {
//   try {
//     const guardado = localStorage.getItem('bb_user');
//     return guardado ? (JSON.parse(guardado) as Usuario) : null;
//   } catch {
//     localStorage.removeItem('bb_user');
//     return null;
//   }
// };

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
//   // Inicialización lazy: recuperarSesion() se ejecuta solo una vez,
//   // antes del primer render. Sin useEffect, sin cascading renders.
//   const [user, setUser] = useState<Usuario | null>(recuperarSesion);

//   const { loginUsuario } = useStorage();

//   // Sincronización entre pestañas (este useEffect sí es correcto
//   // porque solo suscribe a un evento externo, no llama setState
//   // en el cuerpo del efecto sino en un callback)
//   useEffect(() => {
//     const handleStorageChange = (e: StorageEvent) => {
//       if (e.key !== 'bb_user') return;
//       if (e.newValue === null) {
//         setUser(null);
//       } else {
//         try {
//           setUser(JSON.parse(e.newValue) as Usuario);
//         } catch {
//           setUser(null);
//         }
//       }
//     };
//     window.addEventListener('storage', handleStorageChange);
//     return () => window.removeEventListener('storage', handleStorageChange);
//   }, []);

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const usuario = await loginUsuario(email, password);
//       if (usuario) {
//         setUser(usuario);
//         localStorage.setItem('bb_user', JSON.stringify(usuario));
//         return true;
//       }
//       return false;
//     } catch {
//       return false;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('bb_user');
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export { AuthContext };

import { createContext, useState, useEffect } from 'react';
import type { Usuario, AuthContextType } from '../types';
import { db } from '../db/database';

// ============================================================
// AUTH CONTEXT
// Gestiona el estado de autenticación de la aplicación.
//
// NOTA: Se usa db directamente en lugar de useStorage() porque
// useStorage es un hook y su instancia cambia en cada render,
// lo que causaba que loginUsuario fuera una referencia inestable
// dentro del provider. Al llamar db directamente, la lógica de
// autenticación es estable y predecible.
// ============================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ── Recuperar sesión del localStorage ────────────────────────
// Se ejecuta como inicializador lazy del useState, UNA sola vez
// antes del primer render, sin necesidad de useEffect.
// Esto garantiza que si hay sesión guardada, el estado arranca
// directamente autenticado y no hay flash de "no autenticado".
const recuperarSesion = (): Usuario | null => {
  try {
    const guardado = localStorage.getItem('bb_user');
    if (!guardado) return null;

    const usuario = JSON.parse(guardado) as Usuario;

    // Validación mínima: el objeto debe tener email
    if (!usuario?.email) {
      localStorage.removeItem('bb_user');
      return null;
    }

    return usuario;
  } catch {
    localStorage.removeItem('bb_user');
    return null;
  }
};

// ── Proveedor ─────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  // Inicialización lazy: recuperarSesion se pasa como función
  // (sin paréntesis) para que React la ejecute solo una vez.
  const [user, setUser] = useState<Usuario | null>(recuperarSesion);

  // ── Sincronización entre pestañas ────────────────────────
  // El evento 'storage' se dispara cuando localStorage cambia
  // desde OTRA pestaña. Así el logout en una pestaña cierra
  // la sesión en todas.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== 'bb_user') return;

      if (e.newValue === null) {
        setUser(null);
      } else {
        try {
          const usuario = JSON.parse(e.newValue) as Usuario;
          if (usuario?.email) setUser(usuario);
        } catch {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Login ────────────────────────────────────────────────
  // Consulta IndexedDB directamente con db para evitar
  // dependencias inestables de hooks.
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const usuario = await db.usuarios
        .where('email')
        .equals(email.toLowerCase().trim())
        .first();

      if (!usuario) return false;
      if (usuario.password !== password) return false;

      // Sesión válida: guardar en estado y persistir
      setUser(usuario);
      localStorage.setItem('bb_user', JSON.stringify(usuario));
      return true;
    } catch {
      return false;
    }
  };

  // ── Logout ───────────────────────────────────────────────
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

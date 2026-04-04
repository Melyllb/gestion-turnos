import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../types';

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error(
      'useAuth debe usarse dentro de un <AuthProvider>. ' +
      'Asegúrate de que AuthProvider envuelve tu árbol de componentes en App.tsx.'
    );
  }
  return ctx;
};
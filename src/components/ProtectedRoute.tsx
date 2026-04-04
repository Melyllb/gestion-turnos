import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ============================================================
// PROTECTED ROUTE
// Componente guardián que protege las rutas del panel admin.
// Se coloca como elemento de una ruta en App.tsx y decide
// si renderiza el contenido hijo o redirige al login.
//
// Uso en App.tsx:
//   <Route element={<ProtectedRoute />}>
//     <Route path="/admin/turnos" element={<CRUDTurnos />} />
//     <Route path="/admin/reservas" element={<ListadoReservas />} />
//   </Route>
// ============================================================

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Si no hay sesión activa, redirige al login.
  // "replace" reemplaza la entrada en el historial del navegador,
  // así el usuario no puede volver atrás con el botón Back
  // y acceder a la ruta protegida sin autenticarse.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión, renderiza el componente hijo correspondiente
  // a la ruta que se intentó acceder. Outlet es el placeholder
  // donde React Router inyecta el componente de la ruta anidada.
  return <Outlet />;
};

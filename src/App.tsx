import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { TurnosDisponibles } from './pages/TurnosDisponibles';
import { Login } from './pages/Login';
import { AdminTurnos } from './pages/admin/AdminTurnos';
import { AdminReservas } from './pages/admin/AdminReservas';
import { db } from './db/database';

// Inicializar admin por defecto si no existe
db.seedAdmin();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas con PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<TurnosDisponibles />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rutas protegidas con AdminLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/turnos" replace />} />
              <Route path="/admin/turnos" element={<AdminTurnos />} />
              <Route path="/admin/reservas" element={<AdminReservas />} />
            </Route>
          </Route>

          {/* Fallback - redirigir a home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
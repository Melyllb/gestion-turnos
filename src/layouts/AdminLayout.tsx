import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ============================================================
// ADMIN LAYOUT
// Envoltorio para todas las rutas protegidas del panel admin.
// Provee:
//   - Header con logo y datos del usuario logueado
//   - Navegación entre /admin/turnos y /admin/reservas
//   - Botón de cierre de sesión
//   - Outlet donde se inyecta la página activa
// ============================================================

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Fondo ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%)',
        }}
      >
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
            filter: 'blur(70px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        className="w-full px-8 flex items-center justify-between shrink-0"
        style={{
          height: '62px',
          borderBottom: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/admin/turnos')}
          className="flex items-center"
        >
          <span
            className="text-lg font-bold"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            BeautyBrows
          </span>
        </button>

        {/* Navegación central */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/admin/turnos"
            className={({ isActive }) =>
              isActive ? 'font-semibold' : ''
            }
            end
          >
            {({ isActive }) => (
              <span
                className="text-sm transition-colors"
                style={{
                  color: isActive ? '#2563eb' : '#64748b',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  paddingBottom: '2px',
                  display: 'block',
                }}
              >
                Turnos
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/reservas"
            className={({ isActive }) =>
              isActive ? 'font-semibold' : ''
            }
            end
          >
            {({ isActive }) => (
              <span
                className="text-sm transition-colors"
                style={{
                  color: isActive ? '#2563eb' : '#64748b',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  paddingBottom: '2px',
                  display: 'block',
                }}
              >
                Reservas
              </span>
            )}
          </NavLink>
        </nav>

        {/* Usuario + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs" style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>
              {user?.email}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: '#2563eb' }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* ── Contenido de la página activa ── */}
      <main className="flex-1 flex flex-col p-6">
        <div className="max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full px-8 py-6 shrink-0"
        style={{
          borderTop: '1px solid rgba(226,232,240,0.9)',
          backgroundColor: 'rgba(255,255,255,0.95)',
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-bold" style={{ color: '#0f172a' }}>
            BeautyBrows · Panel Admin
          </span>
          <span className="text-xs" style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} BEAUTYBROWS STUDIO. TODOS LOS DERECHOS RESERVADOS.
          </span>
        </div>
      </footer>
    </div>
  );
};

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

  // Clases base y activa para los NavLinks del menú.
  // NavLink recibe una función como className que expone
  // el flag isActive, que es true cuando la ruta coincide.
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'relative px-5 py-2 text-sm tracking-wide transition-all duration-200 rounded-full',
      isActive
        ? 'text-white shadow-md'
        : 'hover:bg-white/10',
    ].join(' ');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        backgroundColor: '#fdf6f0',
      }}
    >

      {/* ── Header / Navbar ── */}
      <header
        className="w-full px-6 py-0 flex items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #6b3f28 0%, #8b5c3e 60%, #a0725a 100%)',
          minHeight: '64px',
          boxShadow: '0 2px 16px rgba(107, 63, 40, 0.25)',
        }}
      >

        {/* Logo */}
        <button
          onClick={() => navigate('/admin/turnos')}
          className="flex items-center gap-3 group shrink-0"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow transition-transform group-hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              letterSpacing: '0.05em',
            }}
          >
            BB
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-sm font-bold text-white tracking-wide"
              style={{ letterSpacing: '0.06em' }}
            >
              BeautyBrows
            </span>
            <span
              className="text-xs text-white/60 uppercase tracking-widest"
              style={{ fontSize: '0.6rem', letterSpacing: '0.18em' }}
            >
              Panel Admin
            </span>
          </div>
        </button>

        {/* ── Navegación central ── */}
        <nav className="flex items-center gap-1">

          <NavLink to="/admin/turnos" className={navLinkClass} end>
            {({ isActive }) => (
              <>
                {/* Pill de fondo cuando está activo */}
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  />
                )}
                <span className="relative flex items-center gap-2 text-white">
                  <span style={{ fontSize: '0.85rem' }}>🗓</span>
                  Turnos
                </span>
              </>
            )}
          </NavLink>

          <NavLink to="/admin/reservas" className={navLinkClass} end>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  />
                )}
                <span className="relative flex items-center gap-2 text-white">
                  <span style={{ fontSize: '0.85rem' }}>📋</span>
                  Reservas
                </span>
              </>
            )}
          </NavLink>

        </nav>

        {/* ── Usuario + Logout ── */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Email del usuario logueado */}
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-xs text-white/50 uppercase tracking-widest" style={{ fontSize: '0.6rem' }}>
              Sesión activa
            </span>
            <span className="text-xs text-white/80 truncate max-w-[160px]">
              {user?.email}
            </span>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-white/20 hidden sm:block" />

          {/* Botón logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white/80 transition-all duration-200 hover:text-white hover:bg-white/15"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontSize: '0.8rem' }}>→</span>
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* ── Indicador de ruta activa (breadcrumb mínimo) ── */}
      <div
        className="w-full px-6 py-2 flex items-center gap-2 text-xs"
        style={{
          borderBottom: '1px solid rgba(180, 130, 100, 0.15)',
          color: '#b87c5a',
          backgroundColor: 'rgba(253, 246, 240, 0.9)',
          letterSpacing: '0.06em',
        }}
      >
        <span>Admin</span>
        <span style={{ color: '#d4a88a' }}>›</span>
        <NavLink
          to="/admin/turnos"
          className={({ isActive }) =>
            isActive ? 'font-semibold text-amber-800' : 'hover:text-amber-800'
          }
        >
          Turnos
        </NavLink>
        <NavLink
          to="/admin/reservas"
          className={({ isActive }) =>
            isActive ? 'font-semibold text-amber-800' : 'hover:text-amber-800'
          }
          style={({ isActive }) => (isActive ? {} : { display: 'none' })}
        >
          › Reservas
        </NavLink>
      </div>

      {/* ── Contenido de la página activa ── */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full px-6 py-3 text-center text-xs"
        style={{
          borderTop: '1px solid rgba(180, 130, 100, 0.15)',
          color: '#b87c5a',
          letterSpacing: '0.08em',
        }}
      >
        BeautyBrows Studio · Panel de Administración
      </footer>
    </div>
  );
};

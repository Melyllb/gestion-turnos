import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// PUBLIC LAYOUT
// Envoltorio para las rutas públicas: / (turnos) y /login.
// Proporciona el header con el logo y el botón de acceso admin,
// el footer, y el fondo visual consistente en toda la zona pública.
// El contenido de cada página se inyecta a través de <Outlet />.
// ============================================================

export const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Saber en qué ruta estamos para ajustar el botón del header
  const estaEnLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* ── Fondo decorativo ── */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #fdf6f0 0%, #fceee3 40%, #fdf0e8 70%, #faf5f0 100%)',
        }}
      >
        {/* Círculos decorativos desenfocados */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #c9956a 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #a0725a 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #d4a88a 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        className="w-full px-6 py-5 flex items-center justify-between"
        style={{
          borderBottom: '1px solid rgba(180, 130, 100, 0.15)',
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(253, 246, 240, 0.85)',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #b87c5a, #8b5c3e)' }}
          >
            BB
          </div>
          <div className="flex flex-col leading-tight">
            <span
              className="text-lg font-bold tracking-wide"
              style={{ color: '#6b3f28', letterSpacing: '0.05em' }}
            >
              BeautyBrows
            </span>
            <span
              className="text-xs tracking-widest uppercase"
              style={{ color: '#b87c5a', letterSpacing: '0.15em' }}
            >
              Studio
            </span>
          </div>
        </button>

        {/* Botón admin / volver */}
        <button
          onClick={() => navigate(estaEnLogin ? '/' : '/login')}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:shadow-md"
          style={{
            border: '1px solid rgba(180, 130, 100, 0.4)',
            color: '#8b5c3e',
            backgroundColor: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.03em',
          }}
        >
          {estaEnLogin ? (
            <>
              <span>←</span>
              <span>Ver turnos</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '0.75rem' }}>⚙</span>
              <span>Acceso admin</span>
            </>
          )}
        </button>
      </header>

      {/* ── Contenido de la página (Outlet) ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer
        className="w-full px-6 py-4 text-center text-xs"
        style={{
          borderTop: '1px solid rgba(180, 130, 100, 0.15)',
          color: '#b87c5a',
          letterSpacing: '0.08em',
          backgroundColor: 'rgba(253, 246, 240, 0.7)',
        }}
      >
        © {new Date().getFullYear()} BeautyBrows Studio · Todos los derechos reservados
      </footer>
    </div>
  );
};

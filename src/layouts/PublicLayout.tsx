import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const estaEnLogin = location.pathname === '/login';

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
          onClick={() => navigate('/')}
          className="flex items-center"
        >
          <span
            className="text-lg font-bold"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}
          >
            BeautyBrows
          </span>
        </button>

        {/* Nav central — solo en rutas públicas que no son login */}
        {!estaEnLogin && (
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Turnos', activo: true, ruta: '/' },
              { label: 'Servicios', activo: false },
            ].map(({ label, activo, ruta }) => (
              <button
                key={label}
                onClick={() => ruta && navigate(ruta)}
                className="text-sm font-medium transition-colors"
                style={{
                  color: activo ? '#2563eb' : '#64748b',
                  borderBottom: activo ? '2px solid #2563eb' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <span className="text-xs font-medium text-slate-600 truncate" style={{ maxWidth: '11rem' }}>
              { user?.email  }
            </span>
          )}

          <button
            onClick={() => {
              if (estaEnLogin) return navigate('/');
              if (isAuthenticated) return navigate('/admin/turnos');
              return navigate('/login');
            }}
            className="text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: '#2563eb' }}
          >
            {estaEnLogin ? 'Ver turnos' : isAuthenticated ? 'Panel Admin' : 'Portal Admin'}
          </button>
        </div>
      </header>

      {/* ── Contenido de la página ── */}
      <main className="flex-1 flex flex-col">
        <Outlet />
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
            BeautyBrows
          </span>
          <div className="flex items-center gap-6">
            {['Política de privacidad', 'Términos de servicio', 'Contacto'].map((item) => (
              <span
                key={item}
                className="text-xs uppercase tracking-wider cursor-pointer transition-colors hover:text-slate-600"
                style={{ color: '#94a3b8', letterSpacing: '0.07em' }}
              >
                {item}
              </span>
            ))}
          </div>
          <span className="text-xs" style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} BEAUTYBROWS STUDIO. TODOS LOS DERECHOS RESERVADOS.
          </span>
        </div>
      </footer>
    </div>
  );
};

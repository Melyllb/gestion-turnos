import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/admin/turnos');
      } else {
        setError('Email o contraseña incorrectos');
      }
    } catch {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/turnos', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-8"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01)',
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}
          >
            <span style={{ color: '#fff', fontWeight: 'bold' }}>BB</span>
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: '#1e3a8a'}}
          >
            Acceso Administrativo
          </h2>
          <p className="text-sm mt-2" style={{ color: '#64748b' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
              style={{ color: '#475569' }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beautybrows.com"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid rgba(59,130,246,0.2)',
                backgroundColor: '#fff',
                color: '#1e293b',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
              required
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
              style={{ color: '#475569' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid rgba(59,130,246,0.2)',
                backgroundColor: '#fff',
                color: '#1e293b',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(59,130,246,0.2)')}
              required
            />
          </div>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg text-center"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            {loading ? 'Ingresando...' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
};
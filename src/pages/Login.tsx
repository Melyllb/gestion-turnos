import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-md rounded-2xl shadow-xl p-8"
        style={{
          backgroundColor: '#fffaf7',
          border: '1px solid rgba(180,130,100,0.2)',
        }}
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
            style={{ background: 'linear-gradient(135deg, #8b5c3e, #a0725a)' }}
          >
            👑
          </div>
          <h2
            className="text-2xl font-bold"
            style={{ color: '#4a2c18', fontFamily: "'Georgia', serif" }}
          >
            Acceso Administrador
          </h2>
          <p className="text-sm mt-1" style={{ color: '#9a7060' }}>
            Ingresa tus credenciales para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: '#7a5040' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@beautybrows.com"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid rgba(180,130,100,0.3)',
                backgroundColor: '#fff',
                color: '#3a2010',
              }}
              required
            />
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: '#7a5040' }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid rgba(180,130,100,0.3)',
                backgroundColor: '#fff',
                color: '#3a2010',
              }}
              required
            />
          </div>

          {error && (
            <p
              className="text-xs px-3 py-2 rounded-lg text-center"
              style={{ backgroundColor: '#fff5f5', color: '#c0392b' }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #8b5c3e, #a0725a)',
              boxShadow: '0 2px 8px rgba(139,92,62,0.3)',
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: '#b0948a' }}>
          Email: admin@beautybrows.com<br />
          Contraseña: admin123
        </p>
      </div>
    </div>
  );
};
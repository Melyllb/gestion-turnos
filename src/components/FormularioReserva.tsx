import { useState } from 'react';
import type { FormularioReserva as FormularioReservaType } from '../types';

// ============================================================
// FORMULARIO RESERVA
// Formulario reutilizable para que el cliente complete
// sus datos al reservar un turno. Se usa dentro de Modal
// en TurnosDisponibles.
//
// Props:
//   onSubmit  → función async que recibe nombre y carnet
//   onCancel  → función para cerrar sin reservar
// ============================================================

interface FormularioReservaProps {
  onSubmit: (datos: FormularioReservaType) => Promise<void>;
  onCancel: () => void;
  exito?: boolean;
}

const estiloInput: React.CSSProperties = {
  border: '1.5px solid rgba(59,130,246,0.2)',
  backgroundColor: '#fff',
  color: '#1e293b',
  fontFamily: "'Inter', sans-serif",
  borderRadius: '0.75rem',
  padding: '0.625rem 1rem',
  width: '100%',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const estiloLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#475569',
  marginBottom: '0.375rem',
};



export const FormularioReserva = ({ onSubmit, onCancel, exito = false }: FormularioReservaProps) => {
  const [datos, setDatos] = useState<FormularioReservaType>({
    nombreCliente: '',
    carnetIdentidad: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const set = (campo: keyof FormularioReservaType, valor: string) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
  };

  const validar = (): string | null => {
    if (!datos.nombreCliente.trim()) return 'El nombre completo es obligatorio';
    if (datos.nombreCliente.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
    if (!datos.carnetIdentidad.trim()) return 'El carnet de identidad es obligatorio';
    if (datos.carnetIdentidad.trim().length < 11 || datos.carnetIdentidad.trim().length>11 ) return 'El carnet debe tener 11 caracteres';
    return null;
  };

  const handleSubmit = async () => {
    const errorLocal = validar();
    if (errorLocal) {
      setError(errorLocal);
      return;
    }
    try {
      setEnviando(true);
      setError(null);
      await onSubmit({
        nombreCliente: datos.nombreCliente.trim(),
        carnetIdentidad: datos.carnetIdentidad.trim(),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al realizar la reserva');
    } finally {
      setEnviando(false);
    }
  };

  // ── Vista de éxito ──
  if (exito) {
    return (
      <div className="text-center py-8">
        <div
          className="mx-auto mb-5 grid place-items-center rounded-full"
          style={{ width: '4.5rem', height: '4.5rem', backgroundColor: '#ecfdf5' }}
        >
          <span className="text-4xl" style={{ color: '#15803d' }}>✓</span>
        </div>
        <p
          className="font-semibold text-2xl mb-2"
          style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
        >
          ¡Reserva confirmada!
        </p>
        <p className="text-sm mb-6" style={{ color: '#475569', lineHeight: '1.7' }}>
          Tu lugar está reservado correctamente. Nuestro equipo te espera en la cita seleccionada.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Nombre */}
      <div>
        <label style={estiloLabel}>Nombre completo</label>
        <input
          type="text"
          value={datos.nombreCliente}
          placeholder="Ej: María García"
          disabled={enviando}
          onChange={(e) => set('nombreCliente', e.target.value)}
          style={estiloInput}
          onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
        />
      </div>

      {/* Carnet */}
      <div>
        <label style={estiloLabel}>Carnet de identidad</label>
        <input
          type="text"
          value={datos.carnetIdentidad}
          placeholder="Ej: 09090987654"
          disabled={enviando}
          maxLength={11}
          onChange={(e) => set('carnetIdentidad', e.target.value)}
          style={estiloInput}
          onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
        />
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            backgroundColor: '#fff5f5',
            color: '#c0392b',
            border: '1px solid #fecdca',
          }}
        >
          {error}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={onCancel}
          disabled={enviando}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          style={{
            backgroundColor: '#f8fafc',
            color: '#64748b',
            border: '1px solid rgba(226,232,240,0.9)',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={enviando}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
          }}
        >
          {enviando ? 'Reservando...' : 'Confirmar reserva'}
        </button>
      </div>
    </div>
  );
};

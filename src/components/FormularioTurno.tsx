import { useState } from 'react';
import type { FormularioTurno as FormularioTurnoType } from '../types';
interface FormularioTurnoProps {
  valorInicial?: Partial<FormularioTurnoType>;
  onSubmit: (datos: FormularioTurnoType) => Promise<void>;
  onCancel: () => void;
  cargando?: boolean;
}

// Valor vacío por defecto para crear un turno nuevo
const TURNO_VACIO: FormularioTurnoType = {
  fecha: '',
  horaInicio: '',
  horaFin: '',
  capacidadMaxima: 5,
};

// Estilo compartido para los campos del formulario
const estiloInput: React.CSSProperties = {
  border: '1px solid rgba(226,232,240,0.8)',
  backgroundColor: '#fff',
  color: '#0f172a',
  fontFamily: "'-apple-system', 'BlinkMacSystemFont', 'Segoe UI', sans-serif",
  borderRadius: '0.5rem',
  padding: '0.625rem 0.875rem',
  width: '100%',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const estiloLabel: React.CSSProperties = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#64748b',
  marginBottom: '0.375rem',
};

export const FormularioTurno = ({
  valorInicial,
  onSubmit,
  onCancel,
  cargando = false,
}: FormularioTurnoProps) => {

  const [datos, setDatos] = useState<FormularioTurnoType>({
    ...TURNO_VACIO,
    ...valorInicial,
  });

  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const modoEdicion = !!valorInicial?.fecha; // Si tiene fecha inicial, es edición

  // Actualiza un campo individual del formulario
  const set = <K extends keyof FormularioTurnoType>(
    campo: K,
    valor: FormularioTurnoType[K]
  ) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    setError(null); // Limpiar error al modificar
  };

  // Validación local antes de llamar al hook
  const validar = (): string | null => {
    if (!datos.fecha) return 'La fecha es obligatoria';
    if (!datos.horaInicio) return 'La hora de inicio es obligatoria';
    if (!datos.horaFin) return 'La hora de fin es obligatoria';
    if (datos.horaInicio >= datos.horaFin) return 'La hora de inicio debe ser anterior a la de fin';
    if (!datos.capacidadMaxima || datos.capacidadMaxima < 1) return 'La capacidad debe ser al menos 1';
    if (datos.capacidadMaxima > 100) return 'La capacidad no puede superar 100';
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
      await onSubmit(datos);
    } catch (e: unknown) {
      // El error viene de useTurnos (solapamiento, etc.)
      setError(e instanceof Error ? e.message : 'Error al guardar el turno');
    } finally {
      setEnviando(false);
    }
  };

  const ocupado = cargando || enviando;

  return (
    <div className="flex flex-col gap-4">

      {/* Fecha */}
      <div>
        <label style={estiloLabel}>Fecha</label>
        <input
          type="date"
          value={datos.fecha}
          disabled={ocupado}
          onChange={(e) => set('fecha', e.target.value)}
          style={estiloInput}
          onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(226,232,240,0.8)')}
        />
      </div>

      {/* Horas — en una fila */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={estiloLabel}>Hora inicio</label>
          <input
            type="time"
            value={datos.horaInicio}
            disabled={ocupado}
            onChange={(e) => set('horaInicio', e.target.value)}
            style={estiloInput}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(226,232,240,0.8)')}
          />
        </div>
        <div>
          <label style={estiloLabel}>Hora fin</label>
          <input
            type="time"
            value={datos.horaFin}
            disabled={ocupado}
            onChange={(e) => set('horaFin', e.target.value)}
            style={estiloInput}
            onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(226,232,240,0.8)')}
          />
        </div>
      </div>

      {/* Capacidad máxima */}
      <div>
        <label style={estiloLabel}>Capacidad máxima</label>
        <input
          type="number"
          min={1}
          max={5}
          value={datos.capacidadMaxima}
          disabled={ocupado}
          onChange={(e) => set('capacidadMaxima', parseInt(e.target.value) || 1)}
          style={estiloInput}
          onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(226,232,240,0.8)')}
        />
      </div>

      {/* Error */}
      {error && (
        <p
          className="text-xs px-3 py-2 rounded-lg"
          style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
          }}
        >
          {error}
        </p>
      )}

      {/* Botones */}
      <div className="flex gap-3 mt-1">
        <button
          onClick={onCancel}
          disabled={ocupado}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{
            border: '1px solid rgba(226,232,240,0.8)',
            color: '#64748b',
            backgroundColor: '#fff',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={ocupado}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}
        >
          {enviando
            ? 'Guardando...'
            : modoEdicion
            ? 'Guardar cambios'
            : 'Crear turno'}
        </button>
      </div>
    </div>
  );
};

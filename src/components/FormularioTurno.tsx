import { useState } from 'react';
import type { FormularioTurno as FormularioTurnoType } from '../types';

// ============================================================
// FORMULARIO TURNO
// Componente reutilizable de formulario para crear y editar turnos.
// Se usa dentro de Modal en CRUDTurnos.
//
// Props:
//   valorInicial → datos del turno a editar (undefined = crear nuevo)
//   onSubmit     → función async que recibe los datos validados
//   onCancel     → función para cerrar sin guardar
//   cargando     → deshabilita el formulario mientras se procesa
// ============================================================

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
  estado: 'activo',
};

// Estilo compartido para los campos del formulario
const estiloInput: React.CSSProperties = {
  border: '1.5px solid rgba(180,130,100,0.3)',
  backgroundColor: '#fff',
  color: '#3a2010',
  fontFamily: "'Georgia', serif",
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
  color: '#7a5040',
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
          onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
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
            onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
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
            onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
          />
        </div>
      </div>

      {/* Capacidad máxima */}
      <div>
        <label style={estiloLabel}>Capacidad máxima</label>
        <input
          type="number"
          min={1}
          max={100}
          value={datos.capacidadMaxima}
          disabled={ocupado}
          onChange={(e) => set('capacidadMaxima', parseInt(e.target.value) || 1)}
          style={estiloInput}
          onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
        />
      </div>

      {/* Estado — solo visible al editar */}
      {modoEdicion && (
        <div>
          <label style={estiloLabel}>Estado</label>
          <select
            value={datos.estado}
            disabled={ocupado}
            onChange={(e) => set('estado', e.target.value as 'activo' | 'inactivo')}
            style={estiloInput}
            onFocus={(e) => (e.target.style.borderColor = '#b87c5a')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(180,130,100,0.3)')}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      )}

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
          disabled={ocupado}
          className="flex-1 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50"
          style={{
            border: '1.5px solid rgba(180,130,100,0.3)',
            color: '#9a7060',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={ocupado}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #8b5c3e, #a0725a)',
            boxShadow: '0 2px 8px rgba(139,92,62,0.3)',
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

import { useState } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useReservas } from '../hooks/useReservas';
import { Modal } from '../components/Modal';
import { FormularioReserva } from '../components/FormularioReserva';
import type { TurnoConDisponibilidad } from '../types';

// ============================================================
// TURNOS DISPONIBLES (REFACTORIZADO)
// Página pública principal. Muestra todos los turnos activos
// con sus cupos disponibles usando componentes reutilizables.
// ============================================================

// ── Tarjeta de turno ──────────────────────────────────────────
interface TarjetaTurnoProps {
  turno: TurnoConDisponibilidad;
  onReservar: (turno: TurnoConDisponibilidad) => void;
}

const TarjetaTurno = ({ turno, onReservar }: TarjetaTurnoProps) => {
  const sinCupos = turno.cuposDisponibles <= 0;
  const pocoCupo = turno.cuposDisponibles <= 2 && turno.cuposDisponibles > 0;

  const formatearFecha = (fecha: string) => {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: sinCupos ? '#f9f5f2' : '#fff',
        border: `1.5px solid ${sinCupos ? 'rgba(180,130,100,0.1)' : 'rgba(180,130,100,0.2)'}`,
        boxShadow: sinCupos ? 'none' : '0 2px 12px rgba(139,92,62,0.06)',
        opacity: sinCupos ? 0.7 : 1,
      }}
    >
      {/* Fecha y Hora */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: '#b87c5a' }}>
            {formatearFecha(turno.fecha)}
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{
              color: sinCupos ? '#b0948a' : '#4a2c18',
              fontFamily: "'Georgia', serif",
            }}
          >
            {turno.horaInicio}
          </p>
          <p className="text-xs mt-0.5" style={{ color: '#b0948a' }}>
            hasta las {turno.horaFin}
          </p>
        </div>

        {/* Badge de cupos usando el estilo del BadgeEstado */}
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={
            sinCupos
              ? { backgroundColor: '#f3ede9', color: '#b0948a' }
              : pocoCupo
              ? { backgroundColor: '#fff3e0', color: '#b45309' }
              : { backgroundColor: '#f0fdf4', color: '#15803d' }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: sinCupos ? '#b0948a' : pocoCupo ? '#f59e0b' : '#22c55e',
            }}
          />
          {sinCupos ? 'Completo' : `${turno.cuposDisponibles} cupos`}
        </span>
      </div>

      {/* Barra de ocupación */}
      <div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(180,130,100,0.12)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((turno.capacidadMaxima - turno.cuposDisponibles) / turno.capacidadMaxima) * 100}%`,
              background: sinCupos
                ? '#d4b0a0'
                : pocoCupo
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #b87c5a, #8b5c3e)',
            }}
          />
        </div>
        <p className="text-xs mt-1" style={{ color: '#c0a090' }}>
          {turno.capacidadMaxima - turno.cuposDisponibles} de {turno.capacidadMaxima} reservados
        </p>
      </div>

      {/* Botón */}
      <button
        onClick={() => !sinCupos && onReservar(turno)}
        disabled={sinCupos}
        className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
        style={
          sinCupos
            ? {
                backgroundColor: '#f3ede9',
                color: '#c0a090',
                cursor: 'not-allowed',
              }
            : {
                background: 'linear-gradient(135deg, #8b5c3e, #a0725a)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(139,92,62,0.25)',
              }
        }
      >
        {sinCupos ? 'No disponible' : 'Reservar lugar'}
      </button>
    </div>
  );
};

// ── Modal de reserva usando componentes reutilizables ──
interface ModalReservaWrapperProps {
  turno: TurnoConDisponibilidad;
  onClose: () => void;
  onConfirmar: (datos: { nombreCliente: string; carnetIdentidad: string }) => Promise<void>;
}

const ModalReservaWrapper = ({ turno, onClose, onConfirmar }: ModalReservaWrapperProps) => {
  const formatearFechaCompleta = (fecha: string) => {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = async (datos: { nombreCliente: string; carnetIdentidad: string }) => {
    await onConfirmar(datos);
  };

  return (
    <Modal
      titulo={`${turno.horaInicio} – ${turno.horaFin}`}
      subtitulo={formatearFechaCompleta(turno.fecha)}
      onClose={onClose}
      ancho="md"
    >
      {/* Badge de cupos dentro del modal */}
      <div className="mb-4">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            backgroundColor: turno.cuposDisponibles <= 2 ? '#fff3e0' : '#f0fdf4',
            color: turno.cuposDisponibles <= 2 ? '#b45309' : '#15803d',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: turno.cuposDisponibles <= 2 ? '#f59e0b' : '#22c55e',
            }}
          />
          {turno.cuposDisponibles} {turno.cuposDisponibles === 1 ? 'cupo disponible' : 'cupos disponibles'}
        </span>
      </div>

      <FormularioReserva onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
};

// ── Página principal ──────────────────────────────────────────
export const TurnosDisponibles = () => {
  const { turnos, cargando, error, recargar } = useTurnos();
  const { crearReserva } = useReservas();

  const [turnoSeleccionado, setTurnoSeleccionado] = useState<TurnoConDisponibilidad | null>(null);

  // Solo mostrar turnos activos
  const turnosActivos = turnos.filter((t) => t.estado === 'activo');

  // Agrupar por fecha para mostrar secciones
  const turnosPorFecha = turnosActivos.reduce<Record<string, TurnoConDisponibilidad[]>>(
    (acc, turno) => {
      if (!acc[turno.fecha]) acc[turno.fecha] = [];
      acc[turno.fecha].push(turno);
      return acc;
    },
    {}
  );

  const fechasOrdenadas = Object.keys(turnosPorFecha).sort();

  const formatearFechaSeccion = (fecha: string) => {
    const [year, month, day] = fecha.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const handleConfirmarReserva = async (datos: { nombreCliente: string; carnetIdentidad: string }) => {
    if (!turnoSeleccionado) return;
    await crearReserva(turnoSeleccionado.id!, datos);
    // Recargar turnos para actualizar disponibilidad
    await recargar();
  };

  // ── Estados de carga / error / vacío ──
  if (cargando) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
            style={{ borderColor: '#b87c5a', borderTopColor: 'transparent' }}
          />
          <p className="mt-3 text-sm" style={{ color: '#b87c5a' }}>Cargando turnos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6">
        <div
          className="text-center max-w-xs p-6 rounded-2xl"
          style={{ backgroundColor: '#fff5f5', border: '1px solid #fecdca' }}
        >
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm" style={{ color: '#c0392b' }}>{error}</p>
          <button
            onClick={recargar}
            className="mt-4 px-4 py-2 rounded-lg text-sm"
            style={{ backgroundColor: '#8b5c3e', color: '#fff' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">

        {/* ── Encabezado de la página ── */}
        <div className="mb-10 text-center md:text-left">
          <p
            className="text-xs uppercase tracking-widest mb-2"
            style={{ color: '#b87c5a', letterSpacing: '0.2em' }}
          >
            BeautyBrows Studio
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{ color: '#3a2010', fontFamily: "'Georgia', serif" }}
          >
            Elige tu momento
          </h1>
          <p className="text-base max-w-2xl mx-auto md:mx-0" style={{ color: '#9a7060' }}>
            Selecciona la fecha y horario que mejor se adapte a ti.
            Nuestras especialistas están listas para cuidar tus cejas.
          </p>
        </div>

        {/* ── Contenido ── */}
        {fechasOrdenadas.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(180,130,100,0.3)' }}
          >
            <p className="text-4xl mb-4">🗓</p>
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: '#6b3f28', fontFamily: "'Georgia', serif" }}
            >
              No hay turnos disponibles
            </p>
            <p className="text-sm" style={{ color: '#b0948a' }}>
              Vuelve a consultar pronto, estamos preparando nuevos horarios.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {fechasOrdenadas.map((fecha) => (
              <section key={fecha}>
                {/* Título de sección por fecha */}
                <div className="flex items-center gap-3 mb-5">
                  <p
                    className="text-base font-semibold capitalize"
                    style={{ color: '#6b3f28', fontFamily: "'Georgia', serif" }}
                  >
                    {formatearFechaSeccion(fecha)}
                  </p>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(180,130,100,0.2)' }} />
                  <span className="text-xs" style={{ color: '#b87c5a' }}>
                    {turnosPorFecha[fecha].filter((t) => t.cuposDisponibles > 0).length} disponibles
                  </span>
                </div>

                {/* Grid de tarjetas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {turnosPorFecha[fecha].map((turno) => (
                    <TarjetaTurno
                      key={turno.id}
                      turno={turno}
                      onReservar={setTurnoSeleccionado}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Leyenda de estado */}
        <div className="mt-12 pt-6 border-t flex flex-wrap justify-center gap-6 text-xs" style={{ borderColor: 'rgba(180,130,100,0.15)' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
            <span style={{ color: '#9a7060' }}>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <span style={{ color: '#9a7060' }}>Últimos cupos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#b0948a' }} />
            <span style={{ color: '#9a7060' }}>Completo</span>
          </div>
        </div>
      </div>

      {/* ── Modal de reserva usando componente reutilizable ── */}
      {turnoSeleccionado && (
        <ModalReservaWrapper
          turno={turnoSeleccionado}
          onClose={() => setTurnoSeleccionado(null)}
          onConfirmar={handleConfirmarReserva}
        />
      )}
    </>
  );
};
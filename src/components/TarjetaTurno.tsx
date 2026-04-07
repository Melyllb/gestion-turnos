import type { TurnoConDisponibilidad } from '../types';

type TarjetaTurnoProps = {
  turno: TurnoConDisponibilidad;
  seleccionado?: boolean;
  onReservar: (turno: TurnoConDisponibilidad) => void;
};

export const TarjetaTurno = ({ turno, seleccionado = false, onReservar }: TarjetaTurnoProps) => {
  const sinCupos = turno.cuposDisponibles <= 0;
  const pocoCupo = turno.cuposDisponibles <= 2 && turno.cuposDisponibles > 0;
  const esTarde = turno.horaInicio >= '12:00';

  return (
    <button
      onClick={() => !sinCupos && onReservar(turno)}
      disabled={sinCupos}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200"
      style={{
        backgroundColor: seleccionado ? '#1d4ed8' : sinCupos ? '#f8fafc' : '#fff',
        border: seleccionado
          ? '1.5px solid #1d4ed8'
          : sinCupos
          ? '1px solid rgba(226,232,240,0.6)'
          : '1px solid rgba(226,232,240,0.9)',
        boxShadow: seleccionado
          ? '0 4px 16px rgba(29,78,216,0.2)'
          : sinCupos
          ? 'none'
          : '0 1px 6px rgba(0,0,0,0.04)',
        cursor: sinCupos ? 'not-allowed' : 'pointer',
        opacity: sinCupos ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className="text-2xl font-bold"
          style={{
            color: seleccionado ? '#fff' : sinCupos ? '#94a3b8' : '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {turno.horaInicio}
        </span>

        {sinCupos ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: '#f1f5f9', color: '#94a3b8' }}
          >
            Sin cupos
          </span>
        ) : pocoCupo ? (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: seleccionado ? 'rgba(255,255,255,0.2)' : '#fff7ed', color: seleccionado ? '#fff' : '#c2410c' }}
          >
            {turno.cuposDisponibles} {turno.cuposDisponibles === 1 ? 'cupo' : 'cupos'}
          </span>
        ) : (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: seleccionado ? 'rgba(255,255,255,0.2)' : '#f0fdf4', color: seleccionado ? '#fff' : '#15803d' }}
          >
            {turno.cuposDisponibles} cupos
          </span>
        )}
      </div>

      <p
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{
          color: seleccionado ? 'rgba(255,255,255,0.7)' : '#94a3b8',
          letterSpacing: '0.1em',
        }}
      >
        {esTarde ? 'Sesión tarde' : 'Sesión mañana'}
      </p>

      {seleccionado && (
        <div
          className="flex items-center gap-1.5 mt-1"
          style={{ color: 'rgba(255,255,255,0.9)' }}
        >
          <span className="text-xs">✓</span>
          <span className="text-xs font-medium">Seleccionado — {turno.horaInicio} a {turno.horaFin}</span>
        </div>
      )}
    </button>
  );
};

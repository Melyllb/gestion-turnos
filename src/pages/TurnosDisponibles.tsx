import { useState, useMemo } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useReservas } from '../hooks/useReservas';
import { Modal } from '../components/Modal';
import { FormularioReserva } from '../components/FormularioReserva';
import type { TurnoConDisponibilidad, FormularioReserva as FormularioReservaType } from '../types';

// ============================================================
// TURNOS DISPONIBLES
// Página pública principal. Layout de dos columnas:
//   Izquierda → calendario para seleccionar fecha
//   Derecha   → grid de turnos del día seleccionado
// ============================================================

// ── Helpers de fecha ─────────────────────────────────────────

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toLocalDate = (fechaStr: string) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatoFechaClave = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// ── Componente Calendario ─────────────────────────────────────

interface CalendarioProps {
  fechaSeleccionada: string;
  onSeleccionar: (fecha: string) => void;
  fechasConTurnos: Set<string>;
}

const Calendario = ({ fechaSeleccionada, onSeleccionar, fechasConTurnos }: CalendarioProps) => {
  const [mes, setMes] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const diasDelMes = useMemo(() => {
    const year = mes.getFullYear();
    const month = mes.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    // Lunes = 0, ajuste para que la semana empiece en lunes
    let inicioSemana = primerDia.getDay() - 1;
    if (inicioSemana < 0) inicioSemana = 6;

    const dias: (Date | null)[] = Array(inicioSemana).fill(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(year, month, d));
    }
    // Rellenar hasta completar la última semana
    while (dias.length % 7 !== 0) dias.push(null);
    return dias;
  }, [mes]);

  const irMesAnterior = () => setMes(new Date(mes.getFullYear(), mes.getMonth() - 1, 1));
  const irMesSiguiente = () => setMes(new Date(mes.getFullYear(), mes.getMonth() + 1, 1));

  const hoyStr = hoy();

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: '#fff',
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Cabecera del calendario */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1rem' }}>📅</span>
          <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>
            {MESES[mes.getMonth()]} {mes.getFullYear()}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={irMesAnterior}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#64748b', fontSize: '0.8rem' }}
          >
            ‹
          </button>
          <button
            onClick={irMesSiguiente}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-slate-100"
            style={{ color: '#64748b', fontSize: '0.8rem' }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS_SEMANA.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: '#94a3b8', letterSpacing: '0.03em' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-y-1">
        {diasDelMes.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} />;

          const clave = formatoFechaClave(dia);
          const estaSeleccionado = clave === fechaSeleccionada;
          const esHoy = clave === hoyStr;
          const tieneTurnos = fechasConTurnos.has(clave);
          const esPasado = clave < hoyStr;

          return (
            <button
              key={clave}
              onClick={() => !esPasado && onSeleccionar(clave)}
              disabled={esPasado}
              className="flex flex-col items-center justify-center rounded-xl transition-all duration-150"
              style={{
                height: '36px',
                fontSize: '0.8rem',
                fontWeight: estaSeleccionado || esHoy ? 600 : 400,
                backgroundColor: estaSeleccionado
                  ? '#1d4ed8'
                  : esHoy && !estaSeleccionado
                  ? '#eff6ff'
                  : 'transparent',
                color: estaSeleccionado
                  ? '#fff'
                  : esPasado
                  ? '#cbd5e1'
                  : esHoy
                  ? '#2563eb'
                  : '#0f172a',
                cursor: esPasado ? 'default' : 'pointer',
              }}
            >
              {dia.getDate()}
              {/* Punto indicador de turnos disponibles */}
              {tieneTurnos && !estaSeleccionado && !esPasado && (
                <span
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: '#3b82f6', display: 'block' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Turno activo seleccionado */}
      {fechaSeleccionada && (
        <div
          className="mt-4 pt-4 rounded-xl p-3"
          style={{
            borderTop: '1px solid rgba(226,232,240,0.8)',
            backgroundColor: '#f8fafc',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>
              Fecha seleccionada
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
            >
              {toLocalDate(fechaSeleccionada).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div
            className="rounded-lg p-2.5"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(226,232,240,0.8)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>
              Sesión de cejas BeautyBrows
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Selecciona un horario disponible →
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Tarjeta de turno ──────────────────────────────────────────

interface TarjetaTurnoProps {
  turno: TurnoConDisponibilidad;
  seleccionado: boolean;
  onReservar: (turno: TurnoConDisponibilidad) => void;
}

const TarjetaTurno = ({ turno, seleccionado, onReservar }: TarjetaTurnoProps) => {
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
      {/* Hora + badge */}
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

        {/* Badge */}
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

      {/* Sesión mañana/tarde */}
      <p
        className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{
          color: seleccionado ? 'rgba(255,255,255,0.7)' : '#94a3b8',
          letterSpacing: '0.1em',
        }}
      >
        {esTarde ? 'Sesión tarde' : 'Sesión mañana'}
      </p>

      {/* Confirmación si está seleccionado */}
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

// ── Página principal ──────────────────────────────────────────

export const TurnosDisponibles = () => {
  const { turnos, cargando, error } = useTurnos();
  const { crearReserva } = useReservas();

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoy());
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<TurnoConDisponibilidad | null>(null);
  const [turnoParaReservar, setTurnoParaReservar] = useState<TurnoConDisponibilidad | null>(null);

  // Fechas que tienen al menos un turno activo con cupos disponibles
  const fechasConTurnos = useMemo(() => {
    const set = new Set<string>();
    turnos
      .filter((t) => t.estado === 'activo' && t.cuposDisponibles > 0)
      .forEach((t) => set.add(t.fecha));
    return set;
  }, [turnos]);

  // Turnos del día seleccionado con cupos disponibles
  const turnosDelDia = useMemo(() => {
    return turnos
      .filter((t) => t.estado === 'activo' && t.cuposDisponibles > 0 && t.fecha === fechaSeleccionada)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }, [turnos, fechaSeleccionada]);

  // const handleSeleccionarTurno = (turno: TurnoConDisponibilidad) => {
  //   setTurnoSeleccionado((prev) => (prev?.id === turno.id ? null : turno));
  // };

  const handleAbrirModal = (turno: TurnoConDisponibilidad) => {
    setTurnoSeleccionado(turno);
    setTurnoParaReservar(turno);
  };

  const handleConfirmarReserva = async (datos: FormularioReservaType) => {
    if (!turnoParaReservar?.id) return;
    await crearReserva(turnoParaReservar.id, datos);
  };

  if (cargando) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
          />
          <p className="mt-3 text-sm" style={{ color: '#64748b' }}>Cargando turnos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="text-center max-w-xs p-6 rounded-2xl"
          style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca' }}
        >
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
        </div>
      </div>
    );
  }

  const fechaFormateada = toLocalDate(fechaSeleccionada).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <div className="flex-1 px-8 py-10 max-w-6xl mx-auto w-full">

        {/* ── Encabezado ── */}
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: '#2563eb', letterSpacing: '0.2em' }}
          >
            Reservaciones
          </p>
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Elige tu momento
          </h1>
          <p className="text-base max-w-md" style={{ color: '#64748b', lineHeight: '1.6' }}>
            Selecciona una fecha y el horario que mejor se adapte a ti. Nuestras especialistas
            están listas para cuidarte.
          </p>
        </div>

        {/* ── Layout dos columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

          {/* ── Columna izquierda: Calendario ── */}
          <div className="flex flex-col gap-4">
            <Calendario
              fechaSeleccionada={fechaSeleccionada}
              onSeleccionar={setFechaSeleccionada}
              fechasConTurnos={fechasConTurnos}
            />
          </div>

          {/* ── Columna derecha: Turnos del día ── */}
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: '#fff',
              border: '1px solid rgba(226,232,240,0.8)',
              boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
            }}
          >
            {/* Cabecera de la sección */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-semibold text-base" style={{ color: '#0f172a' }}>
                  Turnos disponibles
                </h2>
                <p className="text-xs mt-0.5 capitalize" style={{ color: '#94a3b8' }}>
                  {fechaFormateada}
                </p>
              </div>

              {/* Filtro mañana/tarde */}
              <div
                className="flex rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(226,232,240,0.9)' }}
              >
                {['Mañana', 'Tarde'].map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1.5 text-xs font-medium"
                    style={{ color: '#64748b', backgroundColor: '#f8fafc' }}
                  >
                    {label.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid de turnos */}
            {turnosDelDia.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-xl"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px dashed rgba(226,232,240,0.9)',
                }}
              >
                <span className="text-3xl mb-3">🗓</span>
                <p className="font-medium text-sm mb-1" style={{ color: '#475569' }}>
                  Sin turnos para este día
                </p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  Selecciona otra fecha en el calendario
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {turnosDelDia.map((turno) => (
                  <TarjetaTurno
                    key={turno.id}
                    turno={turno}
                    seleccionado={turnoSeleccionado?.id === turno.id}
                    onReservar={handleAbrirModal}
                  />
                ))}
              </div>
            )}

            {/* Barra inferior: acción principal */}
            {turnoSeleccionado && turnosDelDia.length > 0 && (
              <div
                className="mt-5 pt-5 flex items-center justify-between"
                style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}
                  >
                    ✦
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                      Especialista disponible
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      Turno: {turnoSeleccionado.horaInicio} – {turnoSeleccionado.horaFin}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setTurnoParaReservar(turnoSeleccionado)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    boxShadow: '0 2px 12px rgba(37,99,235,0.3)',
                  }}
                >
                  Continuar con la reserva →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sección de garantías ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {[
            {
              icon: '🛡',
              titulo: 'Experiencia garantizada',
              desc: 'Nuestros turnos incluyen una consulta completa para asegurar que tu visión se realice con precisión.',
            },
            {
              icon: '✨',
              titulo: 'Salud & bienestar',
              desc: 'Mantenemos los más altos estándares de higiene en nuestro estudio para tu seguridad y comodidad.',
            },
          ].map(({ icon, titulo, desc }) => (
            <div
              key={titulo}
              className="flex items-start gap-4 p-5 rounded-2xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(226,232,240,0.8)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: '#eff6ff' }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#0f172a' }}>
                  {titulo}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal de reserva ── */}
      {turnoParaReservar && (
        <Modal
          titulo="Completar reserva"
          subtitulo={`${turnoParaReservar.horaInicio} – ${turnoParaReservar.horaFin} · ${toLocalDate(turnoParaReservar.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}
          onClose={() => setTurnoParaReservar(null)}
        >
          <FormularioReserva
            onSubmit={handleConfirmarReserva}
            onCancel={() => setTurnoParaReservar(null)}
          />
        </Modal>
      )}
    </>
  );
};

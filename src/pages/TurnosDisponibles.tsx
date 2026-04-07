import { useState, useMemo, useRef } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useReservas } from '../hooks/useReservas';
import { Modal } from '../components/Modal';
import { FormularioReserva } from '../components/FormularioReserva';
import calendarIcon from '../assets/calendar_month_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png';
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
          <span style={{ fontSize: '1rem' }}>
            <img src={calendarIcon} alt="calendar" />
          </span>
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
  seleccionado?: boolean;
  onReservar: (turno: TurnoConDisponibilidad) => void;
}

const TarjetaTurno = ({ turno, seleccionado = false, onReservar }: TarjetaTurnoProps) => {
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
  const { turnos, cargando, error, recargar } = useTurnos();
  const { crearReserva } = useReservas();

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoy());
  const [turnoParaReservar, setTurnoParaReservar] = useState<TurnoConDisponibilidad | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const cierreModalTimeout = useRef<number | null>(null);
  // Dentro del componente TurnosDisponibles, agrega este estado
const [filtroHorario, setFiltroHorario] = useState<'todas' | 'manana' | 'tarde'>('todas');

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
// Dentro del componente TurnosDisponibles, después de obtener turnosDelDia
const turnosFiltrados = useMemo(() => {
  if (filtroHorario === 'todas') return turnosDelDia;
  
  return turnosDelDia.filter(turno => {
    const hora = parseInt(turno.horaInicio.split(':')[0]);
    const esManana = hora < 12; // Antes de las 12:00 es mañana
    const esTarde = hora >= 12;  // 12:00 o después es tarde
    
    if (filtroHorario === 'manana') return esManana;
    if (filtroHorario === 'tarde') return esTarde;
    return true;
  });
}, [turnosDelDia, filtroHorario]);
  // const handleSeleccionarTurno = (turno: TurnoConDisponibilidad) => {
  //   setTurnoSeleccionado((prev) => (prev?.id === turno.id ? null : turno));
  // };

  const handleAbrirModal = (turno: TurnoConDisponibilidad) => {
    if (cierreModalTimeout.current) {
      window.clearTimeout(cierreModalTimeout.current);
      cierreModalTimeout.current = null;
    }
    setReservaConfirmada(false);
    setTurnoParaReservar(turno);
  };

  const cerrarModal = () => {
    if (cierreModalTimeout.current) {
      window.clearTimeout(cierreModalTimeout.current);
      cierreModalTimeout.current = null;
    }
    setReservaConfirmada(false);
    setTurnoParaReservar(null);
  };

  const handleConfirmarReserva = async (datos: FormularioReservaType) => {
    if (!turnoParaReservar?.id) return;
    try {
      await crearReserva(turnoParaReservar.id, datos);
      await recargar();
      setReservaConfirmada(true);
      cierreModalTimeout.current = window.setTimeout(() => {
        setReservaConfirmada(false);
        setTurnoParaReservar(null);
        cierreModalTimeout.current = null;
      }, 2600);
    } catch (error) {
      console.error('Error al crear reserva:', error);
    }
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
<div
  className="flex rounded-xl overflow-hidden"
  style={{ border: '1px solid rgba(226,232,240,0.9)' }}
>
  <button
    onClick={() => setFiltroHorario('todas')}
    className="px-3 py-1.5 text-xs font-medium transition-all"
    style={{
      color: filtroHorario === 'todas' ? '#fff' : '#64748b',
      backgroundColor: filtroHorario === 'todas' ? '#2563eb' : '#f8fafc',
    }}
  >
    TODAS
  </button>
  <button
    onClick={() => setFiltroHorario('manana')}
    className="px-3 py-1.5 text-xs font-medium transition-all"
    style={{
      color: filtroHorario === 'manana' ? '#fff' : '#64748b',
      backgroundColor: filtroHorario === 'manana' ? '#2563eb' : '#f8fafc',
    }}
  >
    MAÑANA
  </button>
  <button
    onClick={() => setFiltroHorario('tarde')}
    className="px-3 py-1.5 text-xs font-medium transition-all"
    style={{
      color: filtroHorario === 'tarde' ? '#fff' : '#64748b',
      backgroundColor: filtroHorario === 'tarde' ? '#2563eb' : '#f8fafc',
    }}
  >
    TARDE
  </button>
</div>
            </div>
{turnosFiltrados.length === 0 ? (
  <div
    className="flex flex-col items-center justify-center py-16 rounded-xl"
    style={{
      backgroundColor: '#f8fafc',
      border: '1px dashed rgba(226,232,240,0.9)',
    }}
  >
    <span className="text-4xl mb-3">⏰</span>
    <p className="font-medium text-sm mb-1" style={{ color: '#475569' }}>
      No hay turnos en este horario
    </p>
    <p className="text-xs" style={{ color: '#94a3b8' }}>
      {filtroHorario === 'manana' 
        ? 'No hay turnos disponibles por la mañana' 
        : filtroHorario === 'tarde' 
        ? 'No hay turnos disponibles por la tarde'
        : 'No hay turnos para este día'}
    </p>
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
    {turnosFiltrados.map((turno) => (
      <TarjetaTurno
        key={turno.id}
        turno={turno}
        onReservar={handleAbrirModal}
      />
    ))}
  </div>
)}
          </div>
        </div>
      </div>

      {/* ── Modal de reserva ── */}
      {turnoParaReservar && (
        <Modal
          titulo="Completar reserva"
          subtitulo={`${turnoParaReservar.horaInicio} – ${turnoParaReservar.horaFin} · ${toLocalDate(turnoParaReservar.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`}
          onClose={cerrarModal}
        >
          <FormularioReserva
            onSubmit={handleConfirmarReserva}
            onCancel={cerrarModal}
            exito={reservaConfirmada}
          />
        </Modal>
      )}
    </>
  );
};

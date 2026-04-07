import { useState, useMemo, useRef } from 'react';
import { useTurnos } from '../hooks/useTurnos';
import { useReservas } from '../hooks/useReservas';
import { Modal } from '../components/Modal';
import { FormularioReserva } from '../components/FormularioReserva';
import { Calendario } from '../components/Calendario';
import alarmIcon from '../assets/alarm_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg';
import { TarjetaTurno } from '../components/TarjetaTurno';
import type { TurnoConDisponibilidad, FormularioReserva as FormularioReservaType } from '../types';

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const toLocalDate = (fechaStr: string) => {
  const [y, m, d] = fechaStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// ── Página principal ──────────────────────────────────────────

export const TurnosDisponibles = () => {
  const { turnos, cargando, error, recargar } = useTurnos();
  const { crearReserva } = useReservas();

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoy());
  const [turnoParaReservar, setTurnoParaReservar] = useState<TurnoConDisponibilidad | null>(null);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const cierreModalTimeout = useRef<number | null>(null);
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
    <span className="text-4xl mb-3">
      <img src={alarmIcon} alt="Alarm" style={{ width: '30px', height: '30px' }} />
    </span>
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

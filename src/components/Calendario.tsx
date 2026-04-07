import { useMemo, useState } from 'react';
import calendarIcon from '../assets/calendar_month_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png';
import type { FC } from 'react';

type CalendarioProps = {
  fechaSeleccionada: string;
  onSeleccionar: (fecha: string) => void;
  fechasConTurnos: Set<string>;
};

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

export const Calendario: FC<CalendarioProps> = ({ fechaSeleccionada, onSeleccionar, fechasConTurnos }) => {
  const [mes, setMes] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const diasDelMes = useMemo(() => {
    const year = mes.getFullYear();
    const month = mes.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    let inicioSemana = primerDia.getDay() - 1;
    if (inicioSemana < 0) inicioSemana = 6;

    const dias: (Date | null)[] = Array(inicioSemana).fill(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(year, month, d));
    }
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

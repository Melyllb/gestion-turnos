type EstadoTurno = 'activo' | 'inactivo';
type EstadoReserva = 'confirmada' | 'cancelada' | 'completada';

interface BadgeEstadoProps {
  estado: EstadoTurno | EstadoReserva;
}

const estilos: Record<string, React.CSSProperties> = {
  activo:      { backgroundColor: '#f0fdf4', color: '#15803d' },
  inactivo:    { backgroundColor: '#f3ede9', color: '#b0948a' },
  confirmada:  { backgroundColor: '#f0fdf4', color: '#15803d' },
  cancelada:   { backgroundColor: '#fff5f5', color: '#c0392b' },
  completada:  { backgroundColor: '#fef9c3', color: '#b45309' },
};

const etiquetas: Record<string, string> = {
  activo:     'Activo',
  inactivo:   'Inactivo',
  confirmada: 'Confirmada',
  cancelada:  'Cancelada',
  completada: 'Completada',
};

export const BadgeEstado = ({ estado }: BadgeEstadoProps) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
    style={estilos[estado] ?? { backgroundColor: '#f3f4f6', color: '#6b7280' }}
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: 'currentColor', opacity: 0.7 }}
    />
    {etiquetas[estado] ?? estado}
  </span>
);

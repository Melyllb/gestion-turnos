interface ConfirmDialogProps {
  mensaje: string;
  labelAceptar?: string;
  variante?: 'peligro' | 'advertencia';
  onAceptar: () => Promise<void>;
  onCancelar: () => void;
}

export const ConfirmDialog = ({
  mensaje,
  labelAceptar = 'Confirmar',
  variante = 'peligro',
  onAceptar,
  onCancelar,
}: ConfirmDialogProps) => {

  const esPeligro = variante === 'peligro';

  const colorBoton = esPeligro
    ? { background: 'linear-gradient(135deg, #c0392b, #e74c3c)', boxShadow: '0 2px 8px rgba(192,57,43,0.3)' }
    : { background: 'linear-gradient(135deg, #b45309, #d97706)', boxShadow: '0 2px 8px rgba(180,83,9,0.3)' };

  const icono = esPeligro ? '🗑' : '⚠️';

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">

      {/* Ícono */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
        style={{ backgroundColor: esPeligro ? '#fff5f5' : '#fff8f0' }}
      >
        {icono}
      </div>

      {/* Mensaje */}
      <p className="text-sm" style={{ color: '#6b3f28', lineHeight: '1.6' }}>
        {mensaje}
      </p>

      {/* Botones */}
      <div className="flex gap-3 w-full mt-1">
        <button
          onClick={onCancelar}
          className="flex-1 py-2.5 rounded-xl text-sm transition-all"
          style={{
            border: '1.5px solid rgba(180,130,100,0.3)',
            color: '#9a7060',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onAceptar}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={colorBoton}
        >
          {labelAceptar}
        </button>
      </div>
    </div>
  );
};

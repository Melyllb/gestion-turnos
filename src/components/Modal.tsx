import { useEffect } from 'react';

// ============================================================
// MODAL
// Componente reutilizable de diálogo. Se usa en:
//   - TurnosDisponibles: formulario de reserva del cliente
//   - CRUDTurnos: formulario de crear/editar turno
//
// Props:
//   titulo     → texto del encabezado
//   subtitulo  → texto secundario opcional bajo el título
//   onClose    → función que cierra el modal (limpia el estado del padre)
//   children   → contenido interior (formulario, confirmación, etc.)
//   ancho      → tamaño máximo del panel ('sm' | 'md' | 'lg'), default 'md'
// ============================================================

interface ModalProps {
  titulo: string;
  subtitulo?: string;
  onClose: () => void;
  children: React.ReactNode;
  ancho?: 'sm' | 'md' | 'lg';
}

const anchoClase = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Modal = ({ titulo, subtitulo, onClose, children, ancho = 'md' }: ModalProps) => {

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    // Overlay — clic fuera cierra el modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(40, 20, 10, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel del modal */}
      <div
        className={`w-full ${anchoClase[ancho]} rounded-2xl overflow-hidden shadow-2xl`}
        style={{
          backgroundColor: '#fffaf7',
          border: '1px solid rgba(180,130,100,0.2)',
        }}
      >
        {/* Encabezado */}
        <div
          className="px-6 pt-6 pb-4 flex items-start justify-between"
          style={{ borderBottom: '1px solid rgba(180,130,100,0.12)' }}
        >
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: '#4a2c18', fontFamily: "'Georgia', serif" }}
            >
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-sm mt-0.5" style={{ color: '#9a7060' }}>
                {subtitulo}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 shrink-0 ml-4"
            style={{ color: '#b87c5a', fontSize: '1rem' }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
};

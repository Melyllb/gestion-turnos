import { useEffect } from 'react';

interface ModalProps {
  titulo: string;
  subtitulo?: string;
  onClose: () => void;
  children: React.ReactNode;
  ancho?: 'sm' | 'md' | 'lg' | 'xl';
}

const anchoClase = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal = ({ titulo, subtitulo, onClose, children, ancho = 'md' }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${anchoClase[ancho]} max-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(15,23,42,0.18)]`}
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(148,163,184,0.16)',
        }}
      >
        <div
          className="px-6 pt-6 pb-4 flex items-start justify-between"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.16)' }}
        >
          <div>
            <h2
              className="text-xl font-bold"
              style={{ color: '#1e3a8a', fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                {subtitulo}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100 shrink-0 ml-4"
            style={{ color: '#94a3b8', fontSize: '1rem' }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 18rem)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { useReservas } from '../../hooks/useReservas';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { BadgeEstado } from '../../components/BadgeEstado';
import type { ReservaConTurno } from '../../types';

// ============================================================
// ADMIN RESERVAS
// Panel de administración para gestionar reservas.
// Funcionalidades:
//   - Listar todas las reservas con información del turno
//   - Ver detalles del cliente en modal
//   - Cancelar reservas
//   - Filtrar por estado (confirmadas/canceladas)
//   - Buscar por cliente o carnet
// ============================================================

// ── Modal de detalles del cliente ──
interface ModalDetalleClienteProps {
  reserva: ReservaConTurno;
  onClose: () => void;
  onCancelar?: () => void;
}

const ModalDetalleCliente = ({ reserva, onClose, onCancelar }: ModalDetalleClienteProps) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearFechaTurno = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal
      titulo="Detalles del Cliente"
      subtitulo={`Reserva #${reserva.id}`}
      onClose={onClose}
      ancho="xl"
    >
      <div className="flex flex-col gap-5">
        {/* Información del cliente */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
            Información personal
          </h4>
          <div className="space-y-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs" style={{ color: '#94a3b8' }}>Nombre completo</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: '#0f172a' }}>
                {reserva.nombreCliente}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs" style={{ color: '#94a3b8' }}>Carnet de identidad</p>
              <p className="text-base font-semibold mt-0.5" style={{ color: '#0f172a' }}>
                {reserva.carnetIdentidad}
              </p>
            </div>
          </div>
        </div>

        {/* Información del turno */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
            Detalles del turno
          </h4>
          <div className="space-y-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs" style={{ color: '#94a3b8' }}>Fecha</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#0f172a' }}>
                {reserva.turno ? formatearFechaTurno(reserva.turno.fecha) : 'Turno no disponible'}
              </p>
            </div>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs" style={{ color: '#94a3b8' }}>Horario</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#0f172a' }}>
                {reserva.turno 
                  ? `${reserva.turno.horaInicio} – ${reserva.turno.horaFin}`
                  : 'Horario no disponible'}
              </p>
            </div>
          </div>
        </div>

        {/* Información de la reserva */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>
            Información de la reserva
          </h4>
          <div className="space-y-3">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <p className="text-xs" style={{ color: '#94a3b8' }}>Fecha de reserva</p>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#0f172a' }}>
                {formatearFecha(reserva.fechaReserva)}
              </p>
            </div>
            <div
              className="p-3 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Estado</p>
                <div className="mt-1">
                  <BadgeEstado estado={reserva.estado} />
                </div>
              </div>
              {reserva.estado === 'confirmada' && onCancelar && (
                <button
                  onClick={() => {
                    onClose();
                    onCancelar();
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                >
                  Cancelar reserva
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Componente principal ──
export const AdminReservas = () => {
  const { reservas, cargando, error, cancelarReserva, recargar, estadisticas } = useReservas();
  
  const [reservaSeleccionada, setReservaSeleccionada] = useState<ReservaConTurno | null>(null);
  const [reservaACancelar, setReservaACancelar] = useState<ReservaConTurno | null>(null);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState<'todas' | 'confirmada' | 'cancelada'>('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const reservasPorPagina = 10;

  // Filtrar reservas
  const reservasFiltradas = reservas.filter((reserva) => {
    // Filtro por estado
    if (filtroEstado !== 'todas' && reserva.estado !== filtroEstado) return false;
    
    // Filtro por búsqueda (nombre o carnet)
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      return (
        reserva.nombreCliente.toLowerCase().includes(busquedaLower) ||
        reserva.carnetIdentidad.toLowerCase().includes(busquedaLower)
      );
    }
    
    return true;
  });

  // Ordenar por fecha de reserva (más recientes primero)
  const reservasOrdenadas = [...reservasFiltradas].sort((a, b) => {
    return new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime();
  });

  // Paginación
  const indexUltimo = paginaActual * reservasPorPagina;
  const indexPrimero = indexUltimo - reservasPorPagina;
  const reservasActuales = reservasOrdenadas.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(reservasOrdenadas.length / reservasPorPagina);

  // Handlers
  const handleCancelarReserva = async () => {
    if (reservaACancelar) {
      await cancelarReserva(reservaACancelar.id!);
      setReservaACancelar(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearFechaHora = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent mx-auto animate-spin"
            style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}
          />
          <p className="mt-3 text-sm" style={{ color: '#64748b' }}>
            Cargando reservas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div
          className="text-center max-w-xs p-6 rounded-2xl"
          style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}
        >
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
          <button
            onClick={recargar}
            className="mt-4 px-4 py-2 rounded-lg text-sm text-white"
            style={{ backgroundColor: '#2563eb' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
            Gestión de Reservas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Administra las reservas de tus clientes
          </p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Total</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#0f172a' }}>{estadisticas.total}</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Confirmadas</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#15803d' }}>{estadisticas.confirmadas}</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Canceladas</p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#dc2626' }}>{estadisticas.canceladas}</p>
              </div>
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {(['todas', 'confirmada', 'cancelada'] as const).map((estado) => (
              <button
                key={estado}
                onClick={() => {
                  setFiltroEstado(estado);
                  setPaginaActual(1);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: filtroEstado === estado ? '#2563eb' : '#fff',
                  color: filtroEstado === estado ? '#fff' : '#64748b',
                  border: filtroEstado === estado ? 'none' : '1px solid #e2e8f0',
                }}
              >
                {estado === 'todas' ? 'Todas' : estado === 'confirmada' ? 'Confirmadas' : 'Canceladas'}
              </button>
            ))}
          </div>
          
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o carnet..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full px-4 py-2 rounded-lg text-sm outline-none transition-all"
              style={{
                border: '1px solid #e2e8f0',
                backgroundColor: '#fff',
                color: '#0f172a',
              }}
            />
          </div>
          
          <button
            onClick={recargar}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Tabla de reservas */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#fff',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          {reservasActuales.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <span className="text-3xl mb-3">📭</span>
              <p className="font-medium" style={{ color: '#475569' }}>
                No hay reservas que coincidan con los filtros
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                {busqueda ? 'Prueba con otro término de búsqueda' : 'Todavía no hay reservas registradas'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(226,232,240,0.8)',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Carnet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Turno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Fecha Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold" style={{ color: '#64748b' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservasActuales.map((reserva, idx) => (
                    <tr
                      key={reserva.id}
                      style={{
                        borderBottom: idx < reservasActuales.length - 1 ? '1px solid rgba(226,232,240,0.5)' : 'none',
                        opacity: reserva.estado === 'cancelada' ? 0.7 : 1,
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setReservaSeleccionada(reserva)}
                    >
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        <div className="font-medium">{reserva.nombreCliente}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                          ID: #{reserva.id}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        {reserva.carnetIdentidad}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        {reserva.turno ? (
                          <>
                            <div>{formatearFecha(reserva.turno.fecha)}</div>
                            <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                              {reserva.turno.horaInicio} – {reserva.turno.horaFin}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Turno no disponible</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        {formatearFechaHora(reserva.fechaReserva)}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <BadgeEstado estado={reserva.estado} />
                      </td>
                      <td className="px-6 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReservaSeleccionada(reserva);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-blue-50"
                            style={{ color: '#2563eb' }}
                          >
                            Ver detalles
                          </button>
                          {reserva.estado === 'confirmada' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReservaACancelar(reserva);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-50"
                              style={{ color: '#dc2626' }}
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div
            className="mt-4 px-6 py-4 flex items-center justify-between rounded-xl"
            style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
          >
            <p className="text-xs" style={{ color: '#64748b' }}>
              Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, reservasOrdenadas.length)} de {reservasOrdenadas.length} reservas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                }}
              >
                Anterior
              </button>
              <span
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#2563eb', color: '#fff' }}
              >
                {paginaActual}
              </span>
              <button
                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 rounded-lg text-sm transition-all disabled:opacity-50"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del cliente */}
      {reservaSeleccionada && (
        <ModalDetalleCliente
          reserva={reservaSeleccionada}
          onClose={() => setReservaSeleccionada(null)}
          onCancelar={() => {
            if (reservaSeleccionada.estado === 'confirmada') {
              setReservaACancelar(reservaSeleccionada);
            }
          }}
        />
      )}

      {/* Modal de confirmación de cancelación */}
      {reservaACancelar && (
        <Modal
          titulo="Cancelar reserva"
          onClose={() => setReservaACancelar(null)}
          ancho="sm"
        >
          <ConfirmDialog
            mensaje={`¿Estás seguro de que deseas cancelar la reserva de ${reservaACancelar.nombreCliente} para el turno del ${reservaACancelar.turno ? new Date(reservaACancelar.turno.fecha).toLocaleDateString() : '?'}?`}
            labelAceptar="Cancelar reserva"
            variante="peligro"
            onAceptar={handleCancelarReserva}
            onCancelar={() => setReservaACancelar(null)}
          />
        </Modal>
      )}
    </>
  );
};
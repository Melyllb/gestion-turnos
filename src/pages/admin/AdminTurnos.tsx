import { useState } from 'react';
import { useTurnos } from '../../hooks/useTurnos';
import { Modal } from '../../components/Modal';
import { FormularioTurno } from '../../components/FormularioTurno';
import { BadgeEstado } from '../../components/BadgeEstado';
import type { TurnoConDisponibilidad, FormularioTurno as FormularioTurnoType } from '../../types';

// ── Diálogo de confirmación de eliminación ──
interface DialogoConfirmacionProps {
  titulo: string;
  mensaje: string;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
  peligroso?: boolean;
  cargando?: boolean;
}

const DialogoConfirmacion = ({
  mensaje,
  onConfirmar,
  onCancelar,
  peligroso = false,
  cargando = false,
}: DialogoConfirmacionProps) => (
  <div className="flex flex-col gap-4">
    <p className="text-sm" style={{ color: '#64748b', lineHeight: '1.6' }}>
      {mensaje}
    </p>
    <div className="flex gap-3">
      <button
        onClick={onCancelar}
        disabled={cargando}
        className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          border: '1px solid rgba(226,232,240,0.9)',
          color: '#64748b',
          backgroundColor: '#fff',
        }}
      >
        Cancelar
      </button>
      <button
        onClick={onConfirmar}
        disabled={cargando}
        className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-all"
        style={{
          backgroundColor: peligroso ? '#dc2626' : '#2563eb',
        }}
      >
        {cargando ? 'Eliminando...' : 'Eliminar'}
      </button>
    </div>
  </div>
);

export const AdminTurnos = () => {
  const { turnos, cargando, error, crearTurno, editarTurno, eliminarTurno } = useTurnos();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoEditando, setTurnoEditando] = useState<TurnoConDisponibilidad | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [cargandoAccion, setCargandoAccion] = useState(false);

  // Abrir modal para crear nuevo turno
  const abrirCrear = () => {
    setTurnoEditando(null);
    setErrorModal(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar turno
  const abrirEditar = (turno: TurnoConDisponibilidad) => {
    setTurnoEditando(turno);
    setErrorModal(null);
    setModalAbierto(true);
  };

  // Cerrar modal
  const cerrarModal = () => {
    setModalAbierto(false);
    setTurnoEditando(null);
    setErrorModal(null);
  };

  // Guardar turno (crear o editar)
  const guardarTurno = async (datos: FormularioTurnoType) => {
    try {
      setCargandoAccion(true);
      if (turnoEditando?.id) {
        await editarTurno(turnoEditando.id, datos);
      } else {
        await crearTurno(datos);
      }
      cerrarModal();
    } catch (e) {
      setErrorModal(e instanceof Error ? e.message : 'Error al guardar el turno');
    } finally {
      setCargandoAccion(false);
    }
  };

  // Eliminar turno
  const confirmarEliminar = async () => {
    if (!eliminandoId) return;
    try {
      setCargandoAccion(true);
      await eliminarTurno(eliminandoId);
      setEliminandoId(null);
    } catch (e) {
      setErrorModal(e instanceof Error ? e.message : 'Error al eliminar el turno');
      setEliminandoId(null);
    } finally {
      setCargandoAccion(false);
    }
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
            Cargando turnos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0f172a' }}>
              Gestión de Turnos
            </h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
              {turnos.length} {turnos.length === 1 ? 'turno' : 'turnos'} en total
            </p>
          </div>
          <button
            onClick={abrirCrear}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
            }}
          >
            + Crear turno
          </button>
        </div>

        {/* Error general */}
        {error && (
          <div
            className="mb-4 p-4 rounded-lg text-sm"
            style={{
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {/* Tabla de turnos */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#fff',
            border: '1px solid rgba(226,232,240,0.8)',
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          {turnos.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              style={{ backgroundColor: '#f8fafc' }}
            >
              <span className="text-3xl mb-3">📅</span>
              <p className="font-medium" style={{ color: '#475569' }}>
                Sin turnos registrados
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                Crea el primer turno para comenzar
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
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Horario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Capacidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#64748b' }}>
                      Disponibilidad
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
                  {turnos.map((turno) => (
                    <tr
                      key={turno.id}
                      style={{
                        borderBottom: '1px solid rgba(226,232,240,0.5)',
                      }}
                    >
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        {new Date(turno.fecha).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        <span className="font-medium">
                          {turno.horaInicio}
                        </span>
                        <span style={{ color: '#94a3b8' }}> – {turno.horaFin}</span>
                      </td>
                      <td className="px-6 py-3 text-sm" style={{ color: '#0f172a' }}>
                        {turno.capacidadMaxima}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          style={{
                            color: turno.cuposDisponibles > 0 ? '#15803d' : '#dc2626',
                            fontWeight: 500,
                          }}
                        >
                          {turno.cuposDisponibles}/{turno.capacidadMaxima}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <BadgeEstado estado={turno.estado} />
                      </td>
                      <td className="px-6 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirEditar(turno)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-blue-50"
                            style={{ color: '#2563eb' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setEliminandoId(turno.id!)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-red-50"
                            style={{ color: '#dc2626' }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar turno */}
      {modalAbierto && (
        <Modal
          titulo={turnoEditando ? 'Editar turno' : 'Crear nuevo turno'}
          subtitulo={
            turnoEditando
              ? `${turnoEditando.fecha} · ${turnoEditando.horaInicio} – ${turnoEditando.horaFin}`
              : undefined
          }
          onClose={cerrarModal}
          ancho="md"
        >
          <FormularioTurno
            valorInicial={
              turnoEditando
                ? {
                    fecha: turnoEditando.fecha,
                    horaInicio: turnoEditando.horaInicio,
                    horaFin: turnoEditando.horaFin,
                    capacidadMaxima: turnoEditando.capacidadMaxima,
                    estado: turnoEditando.estado,
                  }
                : undefined
            }
            onSubmit={guardarTurno}
            onCancel={cerrarModal}
            cargando={cargandoAccion}
          />
          {errorModal && (
            <div
              className="mt-4 p-3 rounded-lg text-xs"
              style={{
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              }}
            >
              {errorModal}
            </div>
          )}
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {eliminandoId !== null && (
        <Modal
          titulo="Eliminar turno"
          onClose={() => setEliminandoId(null)}
          ancho="sm"
        >
          <DialogoConfirmacion
            titulo="¿Eliminar este turno?"
            mensaje="Esta acción no se puede deshacer. Asegúrate de que no haya reservas confirmadas para este turno."
            onConfirmar={confirmarEliminar}
            onCancelar={() => setEliminandoId(null)}
            peligroso
            cargando={cargandoAccion}
          />
        </Modal>
      )}
    </>
  );
};
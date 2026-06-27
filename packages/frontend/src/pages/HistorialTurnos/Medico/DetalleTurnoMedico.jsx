import { useState } from 'react';
import './HistorialTurnosMedico.css';
import CancelarTurnoModal from '../../../components/CancelarTurnoModal/CancelarTurnoModal.jsx';

const PUEDE_CONFIRMAR = ['RESERVADO'];
const PUEDE_CANCELAR = ['RESERVADO', 'CONFIRMADO', 'PENDIENTE_REPROGRAMACION'];

export default function DetalleTurnoMedico({
  turno,
  cfgEstado,
  formatFecha,
  onVolver,
  onConfirmar,
  onCancelar,
  onAceptarReprogramacion,
  onRechazarReprogramacion,
}) {
  const [modalCancelar, setModalCancelar] = useState(false);

  const puedeConfirmar = PUEDE_CONFIRMAR.includes(turno.estado);
  const puedeCancelar = PUEDE_CANCELAR.includes(turno.estado);
  const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';

  const handleConfirmar = () => {
    if (window.confirm('¿Confirmás este turno?')) onConfirmar();
  };

  const handleAceptar = () => {
    if (window.confirm('¿Aceptás la reprogramación propuesta por el paciente?'))
      onAceptarReprogramacion();
  };

  const handleRechazar = () => {
    if (window.confirm('¿Rechazás la reprogramación? El turno volverá a su fecha original.'))
      onRechazarReprogramacion();
  };

  const handleConfirmarCancelacion = (motivo) => {
    setModalCancelar(false);
    onCancelar(motivo);
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn text-ellipsis" onClick={onVolver}>
          ← Volver a Mis Turnos
        </button>
        <h1 className="historial-title text-ellipsis" style={{ marginTop: '15px' }}>
          Detalle del Turno
        </h1>
        <p className="historial-subtitle text-ellipsis">Información del turno del paciente</p>
      </div>

      <div className="detalle-card">
        <div className="detalle-header-block">
          <span className="detalle-id text-ellipsis">ID de Turno: #{turno._id}</span>
          <span className={`turno-estado ${cfgEstado?.color} text-ellipsis`}>{cfgEstado?.label}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Paciente:</span>
          <span className="detalle-value text-ellipsis">{turno.paciente?.nombre}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Especialidad / Servicio:</span>
          <span className="detalle-value text-ellipsis">{turno.servicio?.nombre || 'General'}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Fecha asignada:</span>
          <span className="detalle-value text-ellipsis">{formatFecha(turno.fechaHora)}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Horario:</span>
          <span className="detalle-value text-ellipsis">{turno.hora} hs</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Sede de atención:</span>
          <span className="detalle-value text-ellipsis">{turno.sede?.nombre || 'No asignada'}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Costo del servicio:</span>
          <span className="detalle-value detalle-value-costo text-ellipsis">
            ${turno.costo?.toLocaleString('es-AR')}
          </span>
        </div>

        {esPendiente && turno.propuestaCambio && (
          <div className="detalle-propuesta-bloque">
            <p className="detalle-propuesta-titulo text-ellipsis">📅 Propuesta del paciente</p>
            <div className="detalle-info-row">
              <span className="detalle-label text-ellipsis">Nueva fecha propuesta:</span>
              <span className="detalle-value text-ellipsis">
                {formatFecha(turno.propuestaCambio.nuevaFechaHora)}
              </span>
            </div>
            <div className="detalle-info-row">
              <span className="detalle-label text-ellipsis">Nuevo horario:</span>
              <span className="detalle-value text-ellipsis">{turno.propuestaCambio.nuevaHora} hs</span>
            </div>
          </div>
        )}

        <div className="detalle-acciones-group">
          {puedeCancelar && !esPendiente && (
            <button className="btn-cancelar-accion text-ellipsis" onClick={() => setModalCancelar(true)}>
              ✕ Cancelar Turno
            </button>
          )}
          {puedeConfirmar && (
            <button className="btn-confirmar-accion text-ellipsis" onClick={handleConfirmar}>
              ✓ Confirmar Turno
            </button>
          )}
          {esPendiente && (
            <>
              <button className="btn-cancelar-accion text-ellipsis" onClick={handleRechazar}>
                ✕ Rechazar
              </button>
              <button className="btn-confirmar-accion text-ellipsis" onClick={handleAceptar}>
                ✓ Aceptar reprogramación
              </button>
            </>
          )}
        </div>
      </div>

      {modalCancelar && (
        <CancelarTurnoModal
          turno={turno}
          onClose={() => setModalCancelar(false)}
          onConfirm={handleConfirmarCancelacion}
        />
      )}
    </div>
  );
}

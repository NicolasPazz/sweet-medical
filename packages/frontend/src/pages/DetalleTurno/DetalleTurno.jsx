import React, { useState } from 'react';
import './DetalleTurno.css';
import CancelarTurnoModal from '../../components/CancelarTurnoModal/CancelarTurnoModal.jsx';
import ReprogramacionModal from '../../components/ReprogramacionModal/ReprogramacionModal.jsx';
import { formatHoraUTC } from '../../lib/dateTime.js';

export default function DetalleTurno({
  turno,
  usuarioId,
  cfgEstado,
  formatFecha,
  onVolver,
  onProponerReprogramacion,
  onCancelar,
  onAceptarReprogramacion,
  onRechazarReprogramacion,
}) {
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalReprogramacion, setModalReprogramacion] = useState(false);

  const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';
  // Si fue el propio paciente quien propuso el cambio, no puede aceptar ni
  // rechazar su propia propuesta: solo puede esperar la respuesta del médico.
  const esPropuestaPropia =
    esPendiente &&
    !!turno.propuestaCambio &&
    String(turno.propuestaCambio.proponenteId) === String(usuarioId);

  const esModificable = ['RESERVADO', 'CONFIRMADO', 'PENDIENTE_REPROGRAMACION'].includes(
    turno.estado,
  );
  // Mientras haya una propuesta pendiente (propia o ajena) no tiene sentido
  // dejar pedir OTRA reprogramación encima; sólo se puede cancelar o, si la
  // propuso el médico, responderla.
  const puedeReprogramar = ['RESERVADO', 'CONFIRMADO'].includes(turno.estado);
  const puedeCancelar = esModificable;

  const handleConfirmarCancelacion = (motivo) => {
    setModalCancelar(false);
    if (onCancelar) {
      onCancelar(motivo);
    } else {
      turno.estado = 'CANCELADO';
      onVolver();
    }
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
        <p className="historial-subtitle text-ellipsis">
          Comprobante e información de tu cita médica
        </p>
      </div>

      <div className="detalle-card">
        <div className="detalle-header-block">
          <span className="detalle-id text-ellipsis">ID de Turno: #{turno._id}</span>
          <span className={`turno-estado ${cfgEstado?.color} text-ellipsis`}>
            {cfgEstado?.label}
          </span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Especialidad / Servicio:</span>
          <span className="detalle-value text-ellipsis">
            {turno.servicio?.nombre ?? turno.servicio ?? 'General'}
          </span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Profesional Médico:</span>
          <span className="detalle-value text-ellipsis">
            {turno.medico?.nombre ?? turno.medico ?? 'N/A'}
          </span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Fecha asignada:</span>
          <span className="detalle-value text-ellipsis">{formatFecha(turno.fechaHora)}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Horario:</span>
          <span className="detalle-value text-ellipsis">{formatHoraUTC(turno.fechaHora)} hs</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Sede de atención:</span>
          <span className="detalle-value text-ellipsis">
            {turno.sede?.nombre ?? turno.sede ?? 'No asignada'}
          </span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label text-ellipsis">Costo del servicio:</span>
          <span className="detalle-value detalle-value-costo text-ellipsis">
            ${turno.costo?.toLocaleString('es-AR')}
          </span>
        </div>

        {esPendiente && turno.propuestaCambio && (
          <div className="detalle-propuesta-bloque">
            <p className="detalle-propuesta-titulo text-ellipsis">
              📅 {esPropuestaPropia ? 'Tu propuesta de reprogramación' : 'Propuesta del médico'}
            </p>
            <div className="detalle-info-row">
              <span className="detalle-label text-ellipsis">Nueva fecha propuesta:</span>
              <span className="detalle-value text-ellipsis">
                {formatFecha(turno.propuestaCambio.nuevaFechaHora)}
              </span>
            </div>
            <div className="detalle-info-row">
              <span className="detalle-label text-ellipsis">Nuevo horario:</span>
              <span className="detalle-value text-ellipsis">
                {turno.propuestaCambio.nuevaHora ||
                  formatHoraUTC(turno.propuestaCambio.nuevaFechaHora)}{' '}
                hs
              </span>
            </div>
          </div>
        )}

        <div className="detalle-acciones-group">
          {puedeCancelar && !esPendiente && (
            <button
              className="btn-cancelar-accion text-ellipsis"
              onClick={() => setModalCancelar(true)}
            >
              ❌ Cancelar Cita
            </button>
          )}
          {puedeReprogramar && (
            <button
              className="btn-nuevo-turno text-ellipsis"
              style={{ position: 'static', margin: '0' }}
              onClick={() => setModalReprogramacion(true)}
            >
              🔄 Reprogramar Fecha
            </button>
          )}
          {esPendiente && !esPropuestaPropia && (
            <>
              <button
                className="btn-cancelar-accion text-ellipsis"
                onClick={onRechazarReprogramacion}
              >
                ✕ Rechazar
              </button>
              <button
                className="btn-nuevo-turno text-ellipsis"
                style={{ position: 'static', margin: '0' }}
                onClick={onAceptarReprogramacion}
              >
                ✓ Aceptar reprogramación
              </button>
            </>
          )}
          {esPendiente && esPropuestaPropia && (
            <span className="detalle-propuesta-espera text-ellipsis">
              ⏳ Esperando respuesta del médico
            </span>
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
      {modalReprogramacion && (
        <ReprogramacionModal
          turno={turno}
          onConfirmar={async ({ fecha, hora, motivo }) => {
            await onProponerReprogramacion(fecha, hora, motivo);
            setModalReprogramacion(false);
          }}
          onCerrar={() => setModalReprogramacion(false)}
        />
      )}
    </div>
  );
}

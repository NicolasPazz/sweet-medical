import './HistorialTurnosMedico.css';

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
  const puedeConfirmar = PUEDE_CONFIRMAR.includes(turno.estado);
  const puedeCancelar = PUEDE_CANCELAR.includes(turno.estado);
  const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';

  const handleConfirmar = () => {
    if (window.confirm('¿Confirmás este turno?')) onConfirmar();
  };

  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de que querés cancelar este turno?')) onCancelar();
  };

  const handleAceptar = () => {
    if (window.confirm('¿Aceptás la reprogramación propuesta por el paciente?')) onAceptarReprogramacion();
  };

  const handleRechazar = () => {
    if (window.confirm('¿Rechazás la reprogramación? El turno volverá a su fecha original.')) onRechazarReprogramacion();
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn" onClick={onVolver}>← Volver a Mis Turnos</button>
        <h1 className="historial-title" style={{ marginTop: '15px' }}>Detalle del Turno</h1>
        <p className="historial-subtitle">Información del turno del paciente</p>
      </div>

      <div className="detalle-card">
        <div className="detalle-header-block">
          <span className="detalle-id">ID de Turno: #{turno._id}</span>
          <span className={`turno-estado ${cfgEstado?.color}`}>{cfgEstado?.label}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Paciente:</span>
          <span className="detalle-value">{turno.paciente?.nombre}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Especialidad / Servicio:</span>
          <span className="detalle-value">{turno.servicio?.nombre || 'General'}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Fecha asignada:</span>
          <span className="detalle-value">{formatFecha(turno.fechaHora)}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Horario:</span>
          <span className="detalle-value">{turno.hora} hs</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Sede de atención:</span>
          <span className="detalle-value">{turno.sede?.nombre || 'No asignada'}</span>
        </div>

        <div className="detalle-info-row">
          <span className="detalle-label">Costo del servicio:</span>
          <span className="detalle-value detalle-value-costo">
            ${turno.costo?.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Bloque de propuesta de reprogramación */}
        {esPendiente && turno.propuestaCambio && (
          <div className="detalle-propuesta-bloque">
            <p className="detalle-propuesta-titulo">📅 Propuesta del paciente</p>
            <div className="detalle-info-row">
              <span className="detalle-label">Nueva fecha propuesta:</span>
              <span className="detalle-value">{formatFecha(turno.propuestaCambio.nuevaFechaHora)}</span>
            </div>
            <div className="detalle-info-row">
              <span className="detalle-label">Nuevo horario:</span>
              <span className="detalle-value">{turno.propuestaCambio.nuevaHora} hs</span>
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="detalle-acciones-group">
          {puedeCancelar && !esPendiente && (
            <button className="btn-cancelar-accion" onClick={handleCancelar}>
              ✕ Cancelar Turno
            </button>
          )}
          {puedeConfirmar && (
            <button className="btn-confirmar-accion" onClick={handleConfirmar}>
              ✓ Confirmar Turno
            </button>
          )}
          {esPendiente && (
            <>
              <button className="btn-cancelar-accion" onClick={handleRechazar}>
                ✕ Rechazar
              </button>
              <button className="btn-confirmar-accion" onClick={handleAceptar}>
                ✓ Aceptar reprogramación
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

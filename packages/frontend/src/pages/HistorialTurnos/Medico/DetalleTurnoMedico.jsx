import { useState, useEffect } from 'react';
import './HistorialTurnosMedico.css';
import CancelarTurnoModal from '../../../components/CancelarTurnoModal/CancelarTurnoModal.jsx';
import ReprogramacionModal from '../../../components/ReprogramacionModal/ReprogramacionModal.jsx';
import { getSedesMe } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import { formatHoraUTC } from '../../../lib/dateTime.js';

function ModalSede({ onConfirmar, onCerrar }) {
  const { email, password } = useAuth();
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getSedesMe({ email, password });
        setSedes(data ?? []);
      } catch {
        setSedes([]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [email, password]);

  const handleSubmit = () => {
    if (!sedeSeleccionada) { setError(true); return; }
    onConfirmar(sedeSeleccionada);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">Confirmar turno</h3>
        <p className="modal-subtitulo">Seleccioná la sede donde se realizará la atención.</p>
        <label className="modal-label">Sede *</label>
        {cargando ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Cargando sedes...</p>
        ) : sedes.length === 0 ? (
          <p style={{ fontSize: 13, color: '#b91c1c' }}>
            No tenés sedes registradas. Agregá una desde Gestión Médica.
          </p>
        ) : (
          <select
            className={`modal-input${error ? ' input-error' : ''}`}
            value={sedeSeleccionada}
            onChange={(e) => { setSedeSeleccionada(e.target.value); setError(false); }}
            autoFocus
          >
            <option value="">-- Seleccioná una sede --</option>
            {sedes.map((s) => (
              <option key={s._id ?? s.id ?? s.nombre} value={s._id ?? s.id}>
                {s.nombre} — {s.direccion}
              </option>
            ))}
          </select>
        )}
        {error && <span className="modal-error">⚠ Debes seleccionar una sede</span>}
        <div className="modal-acciones">
          <button className="btn-cancelar-accion" onClick={onCerrar}>Cancelar</button>
          <button
            className="btn-confirmar-accion"
            onClick={handleSubmit}
            disabled={cargando || sedes.length === 0}
          >
            ✓ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

const PUEDE_CONFIRMAR = ['RESERVADO'];
const PUEDE_CANCELAR = ['RESERVADO', 'CONFIRMADO', 'PENDIENTE_REPROGRAMACION'];

export default function DetalleTurnoMedico({
  turno,
  usuarioId,
  cfgEstado,
  formatFecha,
  onVolver,
  onConfirmar,
  onCancelar,
  onAceptarReprogramacion,
  onRechazarReprogramacion,
  onProponerReprogramacion,
}) {
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalSede, setModalSede] = useState(false);
  const [modalReprogramacion, setModalReprogramacion] = useState(false);

  const PUEDE_REPROGRAMAR = ['RESERVADO', 'CONFIRMADO'];

  const puedeConfirmar = PUEDE_CONFIRMAR.includes(turno.estado);
  const puedeCancelar = PUEDE_CANCELAR.includes(turno.estado);
  const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';
  // Si fue este mismo médico quien propuso el cambio, no puede aceptar ni
  // rechazar su propia propuesta: solo puede esperar la respuesta del paciente.
  const esPropuestaPropia =
    esPendiente &&
    !!turno.propuestaCambio &&
    String(turno.propuestaCambio.proponenteId) === String(usuarioId);

  const handleConfirmar = () => setModalSede(true);

  const handleConfirmarConSede = (sede) => {
    setModalSede(false);
    onConfirmar(sede);
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
          <span className="detalle-value text-ellipsis">{formatHoraUTC(turno.fechaHora)} hs</span>
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
            <p className="detalle-propuesta-titulo text-ellipsis">
              📅 {esPropuestaPropia ? 'Tu propuesta de reprogramación' : 'Propuesta del paciente'}
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
                {turno.propuestaCambio.nuevaHora || formatHoraUTC(turno.propuestaCambio.nuevaFechaHora)} hs
              </span>
            </div>
          </div>
        )}

        <div className="detalle-acciones-group">
          {puedeCancelar && !esPendiente && (
            <button className="btn-cancelar-accion text-ellipsis" onClick={() => setModalCancelar(true)}>
              ✕ Cancelar Turno
            </button>
          )}
          {PUEDE_REPROGRAMAR.includes(turno.estado) && (
            <button className="btn-reprogramar-accion text-ellipsis" onClick={() => setModalReprogramacion(true)}>
              📅 Reprogramar
            </button>
          )}
          {puedeConfirmar && (
            <button className="btn-confirmar-accion text-ellipsis" onClick={handleConfirmar}>
              ✓ Confirmar Turno
            </button>
          )}
          {esPendiente && !esPropuestaPropia && (
            <>
              <button className="btn-cancelar-accion text-ellipsis" onClick={handleRechazar}>
                ✕ Rechazar
              </button>
              <button className="btn-confirmar-accion text-ellipsis" onClick={handleAceptar}>
                ✓ Aceptar reprogramación
              </button>
            </>
          )}
          {esPendiente && esPropuestaPropia && (
            <span className="detalle-propuesta-espera text-ellipsis">
              ⏳ Esperando respuesta del paciente
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
      {modalSede && (
        <ModalSede
          onConfirmar={handleConfirmarConSede}
          onCerrar={() => setModalSede(false)}
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

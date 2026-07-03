import React, { useState } from 'react';
import './ReprogramarTurno.css';

export default function ReprogramarTurno({ turno, onVolver, onFinalizar, onEnviarSolicitud }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  // Listado de horarios disponibles simulados
  const slotsSimulados = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

  const handleConfirmarSolicitud = async () => {
    if (!fecha || !hora) return;
    if (!motivo.trim()) {
      setErrorMotivo(true);
      return;
    }

    // Formato DD/MM/AAAA requerido por el backend (input date da AAAA-MM-DD)
    const fechaFormateada = fecha.split('-').reverse().join('/');

    if (onEnviarSolicitud) {
      setEnviando(true);
      setErrorEnvio('');
      try {
        await onEnviarSolicitud(fechaFormateada, hora, motivo.trim());
        setEnviando(false);
        onFinalizar();
      } catch (err) {
        setErrorEnvio(err.response?.data?.message ?? 'Error al enviar la propuesta de reprogramación');
        setEnviando(false);
        return;
      }
    } else {
      // Fallback local (sin integración con backend)
      turno.fechaHora = `${fecha}T00:00:00`;
      turno.hora = hora;
      turno.estado = 'PENDIENTE_REPROGRAMACION';
      onFinalizar();
    }
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn text-ellipsis" onClick={onVolver}>
          ← Volver al Detalle
        </button>
        <h1 className="historial-title text-ellipsis" style={{ marginTop: '15px' }}>
          Solicitar Reprogramación
        </h1>
        <p className="historial-subtitle text-ellipsis">
          Enviá una propuesta de cambio para tu cita con el {turno.medico?.nombre ?? turno.medico}
        </p>
      </div>

      <div className="reprogramar-card">
        {/* Paso 1: Selección de Fecha */}
        <div className="reprogramar-paso-section">
          <label className="reprogramar-paso-title text-ellipsis">1. Seleccioná el nuevo día propuesto:</label>
          <input
            type="date"
            className="reprogramar-input-fecha"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setHora('');
            }}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Paso 2: Selección de Horario */}
        {fecha && (
          <div className="reprogramar-paso-section">
            <label className="reprogramar-paso-title text-ellipsis">2. Seleccioná un horario disponible:</label>
            <div className="grid-horarios">
              {slotsSimulados.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`hora-slot-btn ${hora === slot ? 'seleccionado' : ''} text-ellipsis`}
                  onClick={() => setHora(slot)}
                >
                  {slot} hs
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Paso 3: Motivo */}
        {fecha && hora && (
          <div className="reprogramar-paso-section">
            <label className="reprogramar-paso-title text-ellipsis">3. Contanos el motivo:</label>
            <textarea
              className="reprogramar-input-fecha"
              rows={3}
              placeholder="Ej: Conflicto de horario laboral..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorMotivo(false);
              }}
              style={{ resize: 'none', fontFamily: 'inherit', width: '100%' }}
            />
            {errorMotivo && (
              <span style={{ color: '#b91c1c', fontSize: 12 }}>⚠ El motivo es obligatorio</span>
            )}
          </div>
        )}

        {errorEnvio && (
          <p style={{ color: '#b91c1c', fontSize: 13 }}>⚠ {errorEnvio}</p>
        )}

        {/* Botón finalizador de flujo transformado a Solicitud */}
        <button
          className="btn-confirmar-cambio text-ellipsis"
          disabled={!fecha || !hora || enviando}
          onClick={handleConfirmarSolicitud}
        >
          {enviando ? 'Enviando...' : 'Enviar Solicitud de Cambio ✓'}
        </button>
      </div>
    </div>
  );
}

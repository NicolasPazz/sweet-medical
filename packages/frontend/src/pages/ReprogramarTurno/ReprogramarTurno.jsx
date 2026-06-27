import React, { useState } from 'react';
import './ReprogramarTurno.css';

export default function ReprogramarTurno({ turno, onVolver, onFinalizar }) {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  // Listado de horarios disponibles simulados
  const slotsSimulados = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

  const handleConfirmarSolicitud = () => {
    if (!fecha || !hora) return;

    // 1. Guardamos la nueva fecha y hora propuestas
    turno.fechaHora = `${fecha}T00:00:00`;
    turno.hora = hora;

    // 2. CORREGIDO: Usamos la propiedad exacta definida en tu ESTADO_CONFIG
    turno.estado = 'PENDIENTE_REPROGRAMACION';

    // 3. Notificación informativa de solicitud para el paciente
    alert(
      `¡Solicitud de reprogramación enviada!\n\n` +
        `Tu propuesta para el día ${fecha.split('-').reverse().join('/')} a las ${hora} hs ` +
        `quedó registrada correctamente.`,
    );

    onFinalizar(); // Te redirige al listado principal
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
          Enviá una propuesta de cambio para tu cita con el {turno.medico?.nombre}
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

        {/* Botón finalizador de flujo transformado a Solicitud */}
        <button
          className="btn-confirmar-cambio text-ellipsis"
          disabled={!fecha || !hora}
          onClick={handleConfirmarSolicitud}
        >
          Enviar Solicitud de Cambio ✓
        </button>
      </div>
    </div>
  );
}

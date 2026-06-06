import { useState } from 'react';
import './HistorialTurnosMedico.css';
import { TURNOS_MEDICO_MOCK } from '../../../mockdata/turnosMedico.js';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import DetalleTurnoMedico from './DetalleTurnoMedico.jsx';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTurnosMedico() {
  const [turnos, setTurnos] = useState([...TURNOS_MEDICO_MOCK]);
  const [filtro, setFiltro] = useState('TODOS');
  const [vista, setVista] = useState('LISTADO');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = filtro === 'TODOS'
    ? turnos
    : turnos.filter((t) => t.estado === filtro);

  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

  const handleConfirmar = (idTurno) => {
    setTurnos((prev) =>
      prev.map((t) => t._id === idTurno ? { ...t, estado: 'CONFIRMADO' } : t)
    );
  };

  const handleCancelar = (idTurno, motivo) => {
    setTurnos((prev) =>
      prev.map((t) => t._id === idTurno ? { ...t, estado: 'CANCELADO', motivoCancelacion: motivo } : t)
    );
    setVista('LISTADO');
  };

  // Aceptar reprogramación: turno vuelve a RESERVADO con la nueva fecha
  const handleAceptarReprogramacion = (idTurno) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t._id !== idTurno) return t;
        return {
          ...t,
          estado: 'RESERVADO',
          fechaHora: t.propuestaCambio.nuevaFechaHora,
          hora: t.propuestaCambio.nuevaHora,
          propuestaCambio: null,
        };
      })
    );
  };

  // Rechazar reprogramación: turno vuelve a RESERVADO con la fecha original intacta
  const handleRechazarReprogramacion = (idTurno) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t._id !== idTurno) return t;
        return { ...t, estado: 'RESERVADO', propuestaCambio: null };
      })
    );
  };

  if (vista === 'DETALLE' && turnoSeleccionado) {
    const turnoActualizado = turnos.find((t) => t._id === turnoSeleccionado._id);
    return (
      <DetalleTurnoMedico
        turno={turnoActualizado}
        cfgEstado={ESTADO_CONFIG[turnoActualizado.estado] ?? { label: turnoActualizado.estado, color: '' }}
        formatFecha={formatFecha}
        onVolver={() => setVista('LISTADO')}
        onConfirmar={() => handleConfirmar(turnoActualizado._id)}
        onCancelar={(motivo) => handleCancelar(turnoActualizado._id, motivo)}
        onAceptarReprogramacion={() => handleAceptarReprogramacion(turnoActualizado._id)}
        onRechazarReprogramacion={() => handleRechazarReprogramacion(turnoActualizado._id)}
      />
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Turnos del Médico</h1>
        <p className="historial-subtitle">Historial y próximos turnos de tus pacientes</p>
      </div>

      <div className="filtros">
        {estados.map((e) => (
          <button
            key={e}
            className={`filtro-btn ${filtro === e ? 'activo' : ''}`}
            onClick={() => setFiltro(e)}
          >
            {e === 'TODOS' ? 'Todos' : ESTADO_CONFIG[e].label}
          </button>
        ))}
      </div>

      {turnosFiltrados.length === 0 ? (
        <p className="historial-vacio">No hay turnos para mostrar.</p>
      ) : (
        <ul className="turnos-lista">
          {turnosFiltrados.map((turno) => {
            const cfg = ESTADO_CONFIG[turno.estado] ?? { label: turno.estado, color: '' };
            const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';
            const puedeConfirmar = turno.estado === 'RESERVADO';

            return (
              <li
                key={turno._id}
                className="turno-card"
                onClick={() => handleAbrirDetalle(turno)}
                style={{ cursor: 'pointer' }}
              >
                <div className="turno-card-left">
                  <span className="turno-fecha">{formatFecha(turno.fechaHora)}</span>
                  <span className="turno-hora">{turno.hora}</span>
                </div>
                <div className="turno-card-center">
                  <span className="turno-servicio">{turno.servicio?.nombre}</span>
                  <span className="turno-medico">{turno.paciente?.nombre}</span>
                  {turno.sede && <span className="turno-sede">{turno.sede.nombre}</span>}
                  {esPendiente && turno.propuestaCambio && (
                    <span className="turno-propuesta">
                      → {formatFecha(turno.propuestaCambio.nuevaFechaHora)} {turno.propuestaCambio.nuevaHora}
                    </span>
                  )}
                </div>
                <div className="turno-card-right">
                  <span className={`turno-estado ${cfg.color}`}>{cfg.label}</span>
                  <span className="turno-costo">${turno.costo?.toLocaleString('es-AR')}</span>
                </div>

                {/* Botones inline — stopPropagation para no abrir detalle */}
                {puedeConfirmar && (
                  <button
                    className="btn-confirmar-inline"
                    onClick={(e) => { e.stopPropagation(); handleConfirmar(turno._id); }}
                  >
                    ✓ Confirmar
                  </button>
                )}
                {esPendiente && (
                  <div className="btns-reprogramacion-inline" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-aceptar-inline"
                      onClick={() => handleAceptarReprogramacion(turno._id)}
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      className="btn-rechazar-inline"
                      onClick={() => handleRechazarReprogramacion(turno._id)}
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

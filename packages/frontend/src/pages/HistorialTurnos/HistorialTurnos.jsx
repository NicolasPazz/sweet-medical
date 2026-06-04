import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HistorialTurnos.css';
import { TURNOS_MOCK, ESTADO_CONFIG } from '../../mockdata/turnos.js';

// IMPORTAMOS TUS SUB-PANTALLAS (Las creamos a continuación)
import DetalleTurno from '../DetalleTurno/DetalleTurno.jsx';
import ReprogramarTurno from '../ReprogramarTurno/ReprogramarTurno.jsx';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTurnos() {
  const [filtro, setFiltro] = useState('TODOS');

  // --- TUS NUEVOS ESTADOS DE FLUJO ---
  const [vista, setVista] = useState('LISTADO'); // 'LISTADO', 'DETALLE', 'REPROGRAMAR'
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = filtro === 'TODOS'
    ? TURNOS_MOCK
    : TURNOS_MOCK.filter((t) => t.estado === filtro);

  // --- CONTROLADORES DE NAVEGACIÓN ---
  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

  // INTERCEPCIÓN 1: Si estás en detalle, mostrás tu pantalla
  if (vista === 'DETALLE') {
    return (
      <DetalleTurno
        turno={turnoSeleccionado}
        cfgEstado={ESTADO_CONFIG[turnoSeleccionado.estado] ?? { label: turnoSeleccionado.estado, color: '' }}
        formatFecha={formatFecha}
        onVolver={() => setVista('LISTADO')}
        onIrAReprogramar={() => setVista('REPROGRAMAR')}
      />
    );
  }

  // INTERCEPCIÓN 2: Si estás en reprogramación, mostrás tu pantalla
  if (vista === 'REPROGRAMAR') {
    return (
      <ReprogramarTurno
        turno={turnoSeleccionado}
        onVolver={() => setVista('DETALLE')}
        onFinalizar={() => setVista('LISTADO')}
      />
    );
  }

  // VISTA POR DEFECTO: El código original de tu compañero intacto
  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Mis Turnos</h1>
        <p className="historial-subtitle">Historial y turnos próximos</p>
      </div>

      {/* Filtros */}
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

      {/* Lista */}
      {turnosFiltrados.length === 0 ? (
        <p className="historial-vacio">No hay turnos para mostrar.</p>
      ) : (
        <ul className="turnos-lista">
          {turnosFiltrados.map((turno) => {
            const cfg = ESTADO_CONFIG[turno.estado] ?? { label: turno.estado, color: '' };
            return (
              <li
                key={turno._id}
                className="turno-card"
                onClick={() => handleAbrirDetalle(turno)} // <-- INTERCEPTAMOS EL CLIC AQUÍ
                style={{ cursor: 'pointer' }} // Guía visual para que sepan que es clickeable
              >
                <div className="turno-card-left">
                  <span className="turno-fecha">{formatFecha(turno.fechaHora)}</span>
                  <span className="turno-hora">{turno.hora}</span>
                </div>
                <div className="turno-card-center">
                  <span className="turno-servicio">{turno.servicio?.nombre}</span>
                  <span className="turno-medico">{turno.medico?.nombre}</span>
                  {turno.sede && <span className="turno-sede">{turno.sede.nombre}</span>}
                </div>
                <div className="turno-card-right">
                  <span className={`turno-estado ${cfg.color}`}>{cfg.label}</span>
                  <span className="turno-costo">${turno.costo?.toLocaleString('es-AR')}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/solicitar-turno" className="btn-nuevo-turno">
        + Nuevo turno
      </Link>
    </div>
  );
}
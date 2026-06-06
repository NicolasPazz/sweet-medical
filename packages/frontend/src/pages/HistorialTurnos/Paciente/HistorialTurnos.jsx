import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HistorialTurnos.css';
import { TURNOS_MOCK, ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import TurnoCard from '../../../components/TurnoCard/TurnoCard.jsx';

import DetalleTurno from '../../DetalleTurno/DetalleTurno.jsx';
import ReprogramarTurno from '../../ReprogramarTurno/ReprogramarTurno.jsx';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTurnos() {
  const [filtro, setFiltro] = useState('TODOS');

  const [vista, setVista] = useState('LISTADO');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = (filtro === 'TODOS')
    ? TURNOS_MOCK
    : TURNOS_MOCK.filter((t) => t.estado === filtro);

  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

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

  if (vista === 'REPROGRAMAR') {
    return (
      <ReprogramarTurno
        turno={turnoSeleccionado}
        onVolver={() => setVista('DETALLE')}
        onFinalizar={() => setVista('LISTADO')}
      />
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Mis Turnos</h1>
        <p className="historial-subtitle">Historial y turnos próximos</p>
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
            return (
              <TurnoCard
                key={turno._id}
                turno={turno}
                cfg={cfg}
                onClickTurno={handleAbrirDetalle}
              />
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HistorialTurnos.css';
import { TURNOS_MOCK, ESTADO_CONFIG } from '../../mockdata/turnos.js';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTurnos() {
  const [filtro, setFiltro] = useState('TODOS');

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = filtro === 'TODOS'
    ? TURNOS_MOCK
    : TURNOS_MOCK.filter((t) => t.estado === filtro);

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
              <li key={turno._id} className="turno-card">
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

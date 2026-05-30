import { useState } from 'react';
import { Link } from 'react-router-dom';
import './HistorialTurnos.css';

const TURNOS_MOCK = [
  {
    _id: '1',
    fechaHora: '2026-05-10T09:00:00',
    hora: '09:00',
    servicio: { nombre: 'Cardiología' },
    medico: { nombre: 'Dr. Ramírez' },
    sede: { nombre: 'Sede Central' },
    costo: 7000,
    estado: 'REALIZADO',
  },
  {
    _id: '2',
    fechaHora: '2026-05-20T11:30:00',
    hora: '11:30',
    servicio: { nombre: 'Dermatología' },
    medico: { nombre: 'Dra. López' },
    sede: { nombre: 'Sede Norte' },
    costo: 5000,
    estado: 'CONFIRMADO',
  },
  {
    _id: '3',
    fechaHora: '2026-06-02T08:00:00',
    hora: '08:00',
    servicio: { nombre: 'Pediatría' },
    medico: { nombre: 'Dr. Gómez' },
    sede: null,
    costo: 4500,
    estado: 'RESERVADO',
  },
  {
    _id: '4',
    fechaHora: '2026-04-15T10:00:00',
    hora: '10:00',
    servicio: { nombre: 'Traumatología' },
    medico: { nombre: 'Dra. Fernández' },
    sede: { nombre: 'Sede Sur' },
    costo: 8000,
    estado: 'CANCELADO',
  },
  {
    _id: '5',
    fechaHora: '2026-06-10T14:00:00',
    hora: '14:00',
    servicio: { nombre: 'Oftalmología' },
    medico: { nombre: 'Dr. Martínez' },
    sede: null,
    costo: 6000,
    estado: 'PENDIENTE_REPROGRAMACION',
  },
];

const ESTADO_CONFIG = {
  DISPONIBLE:               { label: 'Disponible',          color: 'estado-disponible' },
  RESERVADO:                { label: 'Reservado',           color: 'estado-reservado' },
  CONFIRMADO:               { label: 'Confirmado',          color: 'estado-confirmado' },
  CANCELADO:                { label: 'Cancelado',           color: 'estado-cancelado' },
  REALIZADO:                { label: 'Realizado',           color: 'estado-realizado' },
  PENDIENTE_REPROGRAMACION: { label: 'Pend. Reprogramación', color: 'estado-pendiente' },
};

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

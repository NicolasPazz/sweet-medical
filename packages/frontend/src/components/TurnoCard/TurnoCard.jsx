import React from 'react';
import './TurnoCard.css';

export default function TurnoCard({ turno, cfg, onClickTurno }) {
  function formatFecha(fechaHora) {
    const d = new Date(fechaHora);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return (
    <li
      key={turno._id}
      className="turno-card"
      onClick={() => onClickTurno(turno)}
      style={{ cursor: 'pointer' }}
    >
      <div className="turno-card-left">
        <span className="turno-fecha">{formatFecha(turno.fechaHora)}</span>
        <span className="turno-hora">{turno.hora}</span>
      </div>
      <div className="turno-card-center">
        <span className="turno-servicio">{turno.servicio?.nombre ?? turno.servicio}</span>
        <span className="turno-medico">{turno.medico?.nombre ?? turno.medico}</span>
        {turno.sede && <span className="turno-sede">{turno.sede?.nombre ?? turno.sede}</span>}
      </div>
      <div className="turno-card-right">
        <span className={`turno-estado ${cfg.color}`}>{cfg.label}</span>
        <span className="turno-costo">${turno.costo?.toLocaleString('es-AR')}</span>
      </div>
    </li>
  );
}

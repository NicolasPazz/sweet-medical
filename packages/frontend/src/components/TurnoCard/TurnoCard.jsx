import React from 'react';
import './TurnoCard.css';

export default function TurnoCard({ turno, cfg, onClickTurno }) {
  function formatFecha(fechaHora) {
    const d = new Date(fechaHora);
    const dia = String(d.getUTCDate()).padStart(2, '0');
    const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
    const anio = d.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  return (
    <li
      key={turno._id}
      className="turno-card"
      onClick={() => onClickTurno(turno)}
      style={{ cursor: 'pointer' }}
    >
      <div className="turno-card-left">
        <span className="turno-fecha text-ellipsis">{formatFecha(turno.fechaHora)}</span>
        <span className="turno-hora text-ellipsis">{turno.hora}</span>
      </div>
      <div className="turno-card-center">
        <span className="turno-servicio text-ellipsis">{turno.servicio?.nombre ?? turno.servicio}</span>
        <span className="turno-medico text-ellipsis">{turno.medico?.nombre ?? turno.medico}</span>
        {turno.sede && <span className="turno-sede text-ellipsis">{turno.sede?.nombre ?? turno.sede}</span>}
      </div>
      <div className="turno-card-right">
        <span className={`turno-estado ${cfg.color} text-ellipsis`}>{cfg.label}</span>
        <span className="turno-costo text-ellipsis">${turno.costo?.toLocaleString('es-AR')}</span>
      </div>
    </li>
  );
}

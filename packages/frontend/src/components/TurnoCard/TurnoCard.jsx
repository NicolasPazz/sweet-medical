import React from 'react';
import './TurnoCard.css';
import { formatFechaUTC, formatHoraUTC } from '../../lib/dateTime.js';

export default function TurnoCard({ turno, cfg, onClickTurno }) {
  return (
    <li
      key={turno._id}
      className="turno-card"
      onClick={() => onClickTurno(turno)}
      style={{ cursor: 'pointer' }}
    >
      <div className="turno-card-left">
        <span className="turno-fecha text-ellipsis">{formatFechaUTC(turno.fechaHora)}</span>
        <span className="turno-hora text-ellipsis">{formatHoraUTC(turno.fechaHora)}</span>
      </div>
      <div className="turno-card-center">
        <span className="turno-servicio text-ellipsis">
          {turno.servicio?.nombre ?? turno.servicio}
        </span>
        <span className="turno-medico text-ellipsis">{turno.medico?.nombre ?? turno.medico}</span>
        {turno.sede && (
          <span className="turno-sede text-ellipsis">{turno.sede?.nombre ?? turno.sede}</span>
        )}
      </div>
      <div className="turno-card-right">
        <span className={`turno-estado ${cfg.color} text-ellipsis`}>{cfg.label}</span>
        <span className="turno-costo text-ellipsis">${turno.costo?.toLocaleString('es-AR')}</span>
      </div>
    </li>
  );
}

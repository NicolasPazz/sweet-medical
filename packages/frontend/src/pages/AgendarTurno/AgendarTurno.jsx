import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgendarTurno.css';

const SERVICIOS_MOCK = [
  { _id: '1', nombre: 'Cardiología',       duracionTurnoEnMins: 30, costo: 7000 },
  { _id: '2', nombre: 'Dermatología',      duracionTurnoEnMins: 20, costo: 5000 },
  { _id: '3', nombre: 'Pediatría',         duracionTurnoEnMins: 30, costo: 4500 },
  { _id: '4', nombre: 'Traumatología',     duracionTurnoEnMins: 45, costo: 8000 },
  { _id: '5', nombre: 'Oftalmología',      duracionTurnoEnMins: 20, costo: 6000 },
  { _id: '6', nombre: 'Clínica Médica',    duracionTurnoEnMins: 30, costo: 4000 },
];

export default function AgendarTurno() {
  const [seleccionado, setSeleccionado] = useState(null);
  const navigate = useNavigate();

  const handleContinuar = () => {
    if (!seleccionado) return;
    navigate(`/solicitar-turno/${seleccionado._id}`);
  };

  return (
    <div className="agendar-container">
      <div className="agendar-header">
        <h1 className="agendar-title">Agendar Turno</h1>
        <p className="agendar-subtitle">Seleccioná un servicio para continuar</p>
      </div>

      <ul className="servicios-lista">
        {SERVICIOS_MOCK.map((srv) => (
          <li
            key={srv._id}
            className={`servicio-item ${seleccionado?._id === srv._id ? 'seleccionado' : ''}`}
            onClick={() => setSeleccionado(srv)}
          >
            <div className="servicio-info">
              <span className="servicio-nombre">{srv.nombre}</span>
              <div className="servicio-detalles">
                <span className="servicio-tag">{srv.duracionTurnoEnMins} min</span>
                <span className="servicio-tag">${srv.costo}</span>
              </div>
            </div>
            <span className={`servicio-radio ${seleccionado?._id === srv._id ? 'activo' : ''}`} />
          </li>
        ))}
      </ul>

      <button
        className="btn-continuar"
        disabled={!seleccionado}
        onClick={handleContinuar}
      >
        Continuar
      </button>
    </div>
  );
}

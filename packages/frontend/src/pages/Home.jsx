import { Link } from 'react-router-dom';
import TurnoSearchBar from '../components/turnoSearchBar/TurnoSearchBar.jsx';
import './Home.css';

export default function Home() {
  const manejarBusqueda = (termino) => {
    console.log('Buscando turnos para:', termino);
    // fetch(`/api/turnos?q=${termino}`)
  };

  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="home-title">Sweet Medical</h1>

        <p className="home-subtitle">
          Plataforma para la gestión de turnos, profesionales y servicios de salud.
        </p>

        <nav className="options-nav">
          <ul>
            <li>
              <Link to="/historial-medico" className="option-link">
                <img src="/HistorialMedico.png" alt="Listado" className="option-image" />
                <span className="option-title">Ver historial médico</span>
                <span className="descripcion">Visualizar historial de turnos realizados</span>
              </Link>
            </li>
            <li>
              <Link to="/solicitar-turno" className="option-link">
                <img src="/fotoTurno.png" alt="Turno" className="option-image" />
                <span className="option-title">Agendar Turno</span>
                <span className="descripcion">Agendar un turno según un servicio y médico</span>
              </Link>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}

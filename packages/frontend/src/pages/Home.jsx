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
              <a href="/servicio" className="option-link">
                <img src="/Servicio.png" alt="Servicio" className="option-image" />
                <span className="option-title">Ver Servicios</span>
                <span className="descripcion">Ver la lista de servicios disponibles</span>
              </a>
            </li>
            <li>
              <a href="/solicitar-turno" className="option-link">
                <img src="/fotoTurno.png" alt="Turno" className="option-image" />
                <span className="option-title">Solicitar Turno</span>
                <span className="descripcion">Agendar un turno según un servicio y médico</span>
              </a>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { getApiBaseUrl } from '@/lib/api-utils';
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
        <h1 className="home-title text-ellipsis">Sweet Medical</h1>

        <p className="home-subtitle">
          Plataforma para la gestión de turnos, profesionales y servicios de salud.
        </p>

        <div className="search-wrapper">
          <TurnoSearchBar onSearch={manejarBusqueda} />
        </div>
      </main>
    </div>
  );
}

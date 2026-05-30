import { Link } from 'react-router-dom';
import './Header.css'; // Usando tu archivo CSS actual

const Header = () => {
  return (
    <header className="header">
      <div className="navbar-section left">
        <Link to="/">
          <img src="/logo.png" alt="Logo" />
        </Link>
      </div>

      <nav className="navbar-section center">
        <ul>
          <li>
            <Link to="/">Inicio</Link>
          </li>
          <li>
            <Link to="/agendar">Agendar Turno</Link>
          </li>
          <li>
            <Link to="/contacto">Contacto</Link>
          </li>
        </ul>
      </nav>

      <div className="navbar-section right">
        <Link id="iniciar-sesion" to="/login">
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
};

export default Header;

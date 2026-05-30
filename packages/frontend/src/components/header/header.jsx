import './header.css';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';

const Header = () => {
  const { summary } = useCart();

  return (
    <header className="header">
      <img src="/logoSweetMedical.png" alt="Logo" />

      <nav>
        <ul>
          <li>
            <a href="/">Inicio</a>
          </li>
          <li>
            <a href="/about">Agendar Turno</a>
          </li>
          <li>
            <a href="/contact">Contacto</a>
          </li>
          <li>
            <Link to="/servicio">Gestionar servicios</Link>
          </li>
        </ul>
      </nav>

      <div className="header-section right">
        <button className="cart-btn" aria-label="Ver carrito">
          <FaShoppingCart className="cart-icon" />
          {summary?.count > 0 && <span className="cart-count">{summary.count}</span>}
        </button>

        <Link id="iniciar-sesion" to="/login">
          Iniciar sesión
        </Link>
      </div>
    </header>
  );
};

export default Header;

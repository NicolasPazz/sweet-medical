import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import './Navbar.css';

const Navbar = () => {
  const { summary } = useCart();

  return (
    <div className="navbar-bg">
      <nav className="navbar">
        <div className="navbar-section left">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="brand-logo" />
          </Link>
        </div>

        <div className="navbar-section center">
          <ul className="nav-links">
            <li>
              <Link to="/" className="text-ellipsis">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/agendar" className="text-ellipsis">
                Agendar Turno
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="text-ellipsis">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-section right">
          <button className="cart-btn" aria-label="Ver carrito">
            <FaShoppingCart className="cart-icon" />
            {summary?.count > 0 && (
              <span className="cart-count text-ellipsis">{summary.count}</span>
            )}
          </button>

          <Link id="iniciar-sesion" to="/login" className="text-ellipsis">
            Iniciar sesión
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

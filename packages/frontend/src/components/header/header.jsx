import "./header.css";
import { FaShoppingCart, FaHome, FaCalendarAlt, FaHistory, FaBriefcaseMedical, FaEnvelope, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../notification/NotificationBell.jsx';

const Header = () => {
    const { summary } = useCart();
    const location = useLocation();

    return (
        <header className="header">
            <div className="logo-container">
                <img src="/logoSweetMedical.png" alt="Logo" className="logo-img" />
                <div className="logo-text">
                    <h1>Sweet</h1>
                    <span>Medical</span>
                </div>
            </div>

            <nav className="header-nav">
                <ul>
                    <li>
                        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                            <FaHome className="header-icon" />
                            <span className="header-label">Inicio</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/solicitar-turno" className={location.pathname === '/solicitar-turno' ? 'active' : ''}>
                            <FaCalendarAlt className="header-icon" />
                            <span className="header-label">Agendar Turno</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/historial-medico" className={location.pathname === '/historial-medico' ? 'active' : ''}>
                            <FaHistory className="header-icon" />
                            <span className="header-label">Historial Médico</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/servicio" className={location.pathname === '/servicio' ? 'active' : ''}>
                            <FaBriefcaseMedical className="header-icon" />
                            <span className="header-label">Servicios</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                            <FaEnvelope className="header-icon" />
                            <span className="header-label">Contacto</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="header-footer-section">
                <div className="header-actions-row">
                    <button className="cart-btn" aria-label="Ver carrito">
                        <FaShoppingCart className="cart-icon" />
                        {summary?.count > 0 && <span className="cart-count">{summary.count}</span>}
                    </button>
                    <NotificationBell />
                </div>
                <div className="header-auth-row">
                    <Link id="iniciar-sesion" to="/login">
                        <FaUser className="auth-icon" />
                        <span>Iniciar sesión</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;

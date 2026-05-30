import "./header.css";
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link } from 'react-router-dom';

const Header = () => {

    const { summary } = useCart();

    return (
        <header className="header">

            <img src="/logoSweetMedical.png" alt="Logo"/>

            <nav>
            <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/solicitar-turno">Agendar Turno</Link></li>
                <li><Link to="/contact">Contacto</Link></li>
                <li><Link to="/servicio">Gestión de servicios</Link></li>
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
    )
};

export default Header;
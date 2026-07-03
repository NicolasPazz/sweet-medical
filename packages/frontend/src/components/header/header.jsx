import React, { useRef, useState, useEffect } from 'react';
import './header.css';
import {
  FaShoppingCart,
  FaHome,
  FaCalendarAlt,
  FaHistory,
  FaBriefcaseMedical,
  FaEnvelope,
  FaUser,
  FaBars,
  FaTimes,
  FaUserShield,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../notification/NotificationBell.jsx';
import { useAuth } from '../../components/AuthProvider.jsx';
import CartDropdown from '../cart/CartDropdown.jsx';
import { getMe, getRolUsuario } from '../../services/userService.js';

const Header = () => {
  const { summary, clearCart } = useCart();
  const location = useLocation();
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartButtonRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      if (email && password) {
        try {
          const data = await getMe({ email, password });
          setUser({ rol: getRolUsuario(data.usuario?.roles) });
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, [email, password]);

  const handleConfirmarReservaMasiva = () => {
    alert('¡Todos los turnos de tu carrito han sido preseleccionados y guardados con éxito!');
    if (clearCart) clearCart();
    setCartOpen(false);
  };

  return (
    <>
      {/* Overlay para cerrar el menú al tocar afuera en mobile */}
      <div
        className={`nav-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <header className="header">
        <div className="logo-container">
          <a href="/">
            <img src="/logoSweetMedical.png" alt="Logo" className="logo-img" />
          </a>
        </div>

        {/* Navegación (sidebar en desktop / drawer en mobile) */}
        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                <FaHome className="header-icon" />
                <span className="header-label text-ellipsis">Inicio</span>
              </Link>
            </li>
            {user?.rol === 'Paciente' && (
              <li>
                <Link
                  to="/solicitar-turno"
                  className={location.pathname.startsWith('/solicitar-turno') ? 'active' : ''}
                >
                  <FaCalendarAlt className="header-icon" />
                  <span className="header-label text-ellipsis">Agendar Turno</span>
                </Link>
              </li>
            )}
            {user?.rol === 'Paciente' && (
              <li>
                <Link
                  to="/historial-medico"
                  className={location.pathname === '/historial-medico' ? 'active' : ''}
                >
                  <FaHistory className="header-icon" />
                  <span className="header-label text-ellipsis">Historial Médico</span>
                </Link>
              </li>
            )}
            {user?.rol === 'Médico' && (
              <li>
                <Link
                  to="/gestion-medico"
                  className={location.pathname.startsWith('/gestion-medico') ? 'active' : ''}
                >
                  <FaBriefcaseMedical className="header-icon" />
                  <span className="header-label text-ellipsis">Gestión médica</span>
                </Link>
              </li>
            )}

            {user?.rol === 'Admin' && (
              <li>
                <Link
                  to="/gestion-admin"
                  className={location.pathname.startsWith('/gestion-admin') ? 'active' : ''}
                >
                  <FaUserShield className="header-icon" />
                  <span className="header-label text-ellipsis">Panel administrador</span>
                </Link>
              </li>
            )}

            <li>
              <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
                <FaEnvelope className="header-icon" />
                <span className="header-label text-ellipsis">Contacto</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-footer-section">
          <div className="header-actions-row">
            <button
              ref={cartButtonRef}
              className={`cart-btn ${cartOpen ? 'cart-btn--active' : ''}`}
              aria-label="Ver carrito"
              onClick={() => setCartOpen((prev) => !prev)}
            >
              <FaShoppingCart className="cart-icon" />
              {summary?.count > 0 && (
                <span className="cart-count text-ellipsis">{summary.count}</span>
              )}
            </button>

            <NotificationBell />
          </div>

          <div className="header-auth-row">
            {isAuthenticated ? (
              <Link id="iniciar-sesion" to="/perfil">
                <FaUser className="auth-icon" />
                <span className="text-ellipsis">Mi Perfil</span>
              </Link>
            ) : (
              <Link id="iniciar-sesion" to="/login">
                <FaUser className="auth-icon" />
                <span className="text-ellipsis">Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>

        {/* Botón hamburger — solo visible en mobile */}
        <button
          className="hamburger-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Carrito desplegable */}
        <CartDropdown
          open={cartOpen}
          setOpen={setCartOpen}
          anchorRef={cartButtonRef}
          onConfirmarReserva={() => {
            setCartOpen(false);
          }}
        />
      </header>
    </>
  );
};

export default Header;

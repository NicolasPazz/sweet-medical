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
  FaStethoscope,
} from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../notification/NotificationBell.jsx';
import { useAuth } from '../../components/AuthProvider.jsx';
import CartDropdown from '../cart/CartDropdown.jsx';
import { getMe, getRolUsuario } from '../../services/userService.js';
import ToggleSwitchBotton from '../toggle-switch-botton/toggle-switch-botton.jsx';
import { useModoVista } from '../ModoVistaContext.jsx';

const Header = () => {
  const { summary, clearCart } = useCart();
  const location = useLocation();
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const { modo, setModo } = useModoVista();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartButtonRef = useRef(null);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      if (email && password) {
        try {
          const data = await getMe({ email, password });
          const roles = data.usuario?.roles ?? [];
          const esMultiRol = roles.includes('PACIENTE') && roles.includes('MEDICO');

          setMultiplesFiltros(esMultiRol);

          if (esMultiRol) {
            // Con múltiples roles no colapsamos a un único "rol": el nav se
            // filtra más abajo según el switch (modo), no según el rol.
            setUser({ roles });
          } else {
            setUser({ rol: getRolUsuario(roles) });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMultiplesFiltros(false);
          setUser(null);
        }
      } else {
        setUser(null);
        setMultiplesFiltros(false);
      }
    };
    fetchUser();
  }, [email, password]);

  // Rol efectivo para decidir qué mostrar en el nav:
  // - Si el usuario tiene un solo rol relevante, se usa ese rol directamente.
  // - Si tiene múltiples (Paciente Y Médico a la vez), se filtra por la
  //   opción colocada en el switch (modo), no por el rol del usuario.
  const rolVisible = multiplesFiltros
    ? (modo === 'modo-medico' ? 'Médico' : 'Paciente')
    : user?.rol;


  return (
    <>
      {/* Overlay para cerrar el menú al tocar afuera en mobile */}
      <div
        className={`nav-overlay ${menuOpen ? 'visible' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <header className="header">

        <div className="up-section">
          <div className="logo-container">
            <a href="/">
              <img src="/logoSweetMedical.png" alt="Logo" className="logo-img" />
            </a>
          </div>

          {multiplesFiltros && (
            <div className="logo-toggle-row">
              <p className="logo-toggle-label">
                {modo === 'modo-paciente' ? 'Modo Paciente' : 'Modo Médico'}
              </p>
              <ToggleSwitchBotton
                checked={modo === 'modo-medico'}
                onChange={(checked) => setModo(checked ? 'modo-medico' : 'modo-paciente')}
                ariaLabel="Cambiar entre modo paciente y modo médico"
              />
            </div>
          )}
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
            <li>
              <Link to="/oferta-medica" className={location.pathname === '/oferta-medica' ? 'active' : ''}>
                <FaStethoscope className="header-icon" />
                <span className="header-label text-ellipsis">Oferta Médica</span>
              </Link>
            </li>
            {rolVisible === 'Paciente' && (
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
            {rolVisible === 'Paciente' && (
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
            {rolVisible === 'Médico' && (
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
                  <FaUserShield className='header-icon' />
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
            {rolVisible === 'Paciente' && (
              <button
                ref={cartButtonRef}
                className={`cart-btn ${cartOpen ? 'cart-btn--active' : ''}`}
                aria-label="Ver carrito"
                onClick={() => setCartOpen((prev) => !prev)}
              >
                <FaShoppingCart className="cart-icon" />
                {summary?.count > 0 && <span className="cart-count text-ellipsis">{summary.count}</span>}
              </button>
            )}

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
        {rolVisible === 'Paciente' && (
          <CartDropdown
            open={cartOpen}
            setOpen={setCartOpen}
            anchorRef={cartButtonRef}
            onConfirmarReserva={() => {
              setCartOpen(false);
            }}
          />
        )}
      </header>
    </>
  );
};

export default Header;

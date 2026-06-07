import React, { useRef } from 'react'; // <-- Agregamos useState y useRef
import "./header.css";
import { FaShoppingCart, FaHome, FaCalendarAlt, FaHistory, FaBriefcaseMedical, FaEnvelope, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext.jsx';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../notification/NotificationBell.jsx';
import { useAuth } from "../../components/AuthProvider.jsx";
import { getUserByToken } from '../../services/userService.js';
import { useState, useEffect } from 'react';
import CartDropdown from '../cart/CartDropdown.jsx'; // <-- Importamos tu nuevo componente

const Header = () => {
    const { summary, cartItems, removeItem, clearCart } = useCart(); // <-- Sacamos los elementos y acciones del Context
    const location = useLocation();

    const { token } = useAuth();

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await getUserByToken(token);
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUser();
    }, [token]);

    // Estados para controlar la apertura y el ancla del carrito
    const [cartOpen, setCartOpen] = useState(false);
    const cartButtonRef = useRef(null); // <-- Guardará la posición exacta del botón en la UI

    const handleConfirmarReservaMasiva = () => {
        alert("¡Todos los turnos de tu carrito han sido preseleccionados y guardados con éxito!");
        if (clearCart) clearCart();
        setCartOpen(false);
    };

    return (
        <header className="header">
            <div className="logo-container">
                <a href="/">
                    <img src="/logoSweetMedical.png" alt="Logo" className="logo-img" />
                </a>
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
                      {user?.rol === "Paciente" && (
                        <li>
                            <Link to="/historial-medico" className={location.pathname === '/historial-medico' ? 'active' : ''}>
                                <FaHistory className="header-icon" />
                                <span className="header-label">Historial Médico</span>
                            </Link>
                        </li> 
                    )}
                    {user?.rol === "Médico" && (
                        <li>
                            <Link to="/gestion-medico" className={location.pathname === '/gestion-medico' ? 'active' : ''}>
                                <FaBriefcaseMedical className="header-icon" />
                                <span className="header-label">Gestión médica</span>
                            </Link>
                        </li>
                    )}
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
                    {/* BOTÓN DEL CARRITO CON SU ACCIÓN Y SU REFERENCIA ASIGNADA */}
                    <button
                        ref={cartButtonRef} // ← Guarda la coordenada física del botón
                        className={`cart-btn ${cartOpen ? 'cart-btn--active' : ''}`}
                        aria-label="Ver carrito"
                        onClick={() => setCartOpen(prev => !prev)} // ← Abre y cierra el menú
                    >
                        <FaShoppingCart className="cart-icon" />
                        {summary?.count > 0 && <span className="cart-count">{summary.count}</span>}
                    </button>

                    <NotificationBell />
                </div>

                <div className="header-auth-row">
                    {useAuth().isAuthenticated ? (
                        <Link id="iniciar-sesion" to="/perfil">
                            <FaUser className="auth-icon" />
                            <span>Mi Perfil</span>
                        </Link>
                    ) : (
                        <Link id="iniciar-sesion" to="/login">
                            <FaUser className="auth-icon" />
                            <span>Iniciar sesión</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* CONTROL DESPLEGABLE DEL CARRITO ENLAZADO AL CONTEXTO */}
            <CartDropdown
                open={cartOpen}
                setOpen={setCartOpen}
                anchorRef={cartButtonRef} // Pasa el ancla para calcular la posición exacta
                onConfirmarReserva={() => {
                    setStep(5);        // 1. Mandamos al usuario directo al paso 5 (Revisar y Confirmar)
                    setCartOpen(false); // 2. Cerramos el dropdown flotante para que no estorbe la vista
                }}
            />
        </header>
    );
};

export default Header;
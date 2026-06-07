import React, { useState, useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext.jsx'; // Importamos el contexto global
import './CartDropdown.css';

export default function CarritoDropdown({ open, setOpen, onConfirmarReserva, anchorRef }) {
    // Traemos los datos y funciones del estado global
    const { items, removeTurn, clearCart } = useCart();

    const [dropdownStyle, setDropdownStyle] = useState({});
    const dropdownRef = useRef(null);

    // Calculamos el costo acumulado usando la propiedad costoEstimado o costo
    const totalCosto = items.reduce((acc, item) => acc + (item.costoEstimado ?? item.costo ?? 0), 0);

    // Cerrar al hacer click fuera del menú desplegable
    useEffect(() => {
        function handleClickOutside(e) {
            if (anchorRef.current && anchorRef.current.contains(e.target)) return;
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [anchorRef, setOpen]);

    // Recalcular la posición fixed exacta arriba del botón asignado
    useEffect(() => {
        if (open && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                bottom: window.innerHeight - rect.top + 8,
                left: rect.left,
                width: 360,
            });
        }
    }, [open, anchorRef, items]);

    if (!open) return null;

    return (
        <div
            className="cart-dropdown"
            ref={dropdownRef}
            style={{
                ...dropdownStyle,
                maxHeight: Math.min(480, window.innerHeight - (window.innerHeight - (anchorRef.current?.getBoundingClientRect().top ?? 0)) - 16)
            }}
        >
            {/* Encabezado */}
            <div className="cart-header">
                <span className="cart-header__title">Turnos Seleccionados</span>
                {items.length > 0 && (
                    <button className="cart-header__clear" onClick={clearCart}>
                        Vaciar todo
                    </button>
                )}
            </div>

            {/* Lista de turnos */}
            <div className="cart-list">
                {items.length === 0 ? (
                    <div className="cart-empty">
                        <span className="cart-empty__icon">🛒</span>
                        <p>No tenés turnos en el carrito</p>
                    </div>
                ) : (
                    items.map((item) => {
                        // Adaptamos dinámicamente las propiedades del objeto guardado
                        const servicioNombre = item.especialidad || item.practica || item.servicio?.nombre || 'Consulta Médica';
                        const medicoNombre = item.medico?.nombre || 'Médico General';
                        const itemId = item.id || item._id;

                        return (
                            <div key={itemId} className="cart-item">
                                <span className="cart-item__icon">📅</span>
                                <div className="cart-item__body">
                                    <p className="cart-item__service">{servicioNombre}</p>
                                    <p className="cart-item__doctor">{medicoNombre}</p>
                                    <p className="cart-item__meta">
                                        {item.fecha || 'Propuesta'} - {item.hora || '00:00'} hs
                                    </p>
                                    <p className="cart-item__sede" style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
                                        📍 Sede: {item.sede?.nombre || 'No especificada'}
                                    </p>
                                </div>
                                <button
                                    className="cart-item__remove"
                                    onClick={() => removeTurn(itemId)}
                                    title="Quitar del carrito"
                                >
                                    ✕
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer con el botón confirmador */}
            {items.length > 0 && (
                <div className="cart-footer">
                    <div className="cart-footer__total-row">
                        <span>Total estimado:</span>
                        <span className="cart-footer__price">
                            {totalCosto === 0 ? "Sin costo (Cubierto)" : `$${totalCosto.toLocaleString('es-AR')}`}
                        </span>
                    </div>
                    {/* Al hacer click acá, se ejecuta la función que le pasaste desde el componente principal */}
                    <button
                        className="cart-footer__btn-confirm"
                        onClick={() => {
                            // Dispara un evento global avisando que se quiere ir a confirmar
                            window.dispatchEvent(new Event('ir_a_confirmar_turnos'));
                            setOpen(false); // Cierra el dropdown
                        }}
                    >
                        Confirmar Reserva Masiva ✓
                    </button>
                </div>
            )}
        </div>
    );
}
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';
import './CartDropdown.css';

export default function CarritoDropdown({ open, setOpen, onConfirmarReserva, anchorRef }) {
  const { items, removeTurn, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownStyle, setDropdownStyle] = useState({});
  const dropdownRef = useRef(null);

  // Cálculo del costo total de manera segura
  const totalCosto = items.reduce((acc, item) => acc + (item.costoEstimado ?? item.costo ?? 0), 0);

  // Manejo de clicks fuera del dropdown para cerrarlo
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

  // Manejo del posicionamiento dinámico (Desktop vs Mobile)
  useEffect(() => {
    function handlePosition() {
      if (open && anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
          // En mobile: desplegar hacia abajo desde el botón
          setDropdownStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            right: 8,
            left: 'auto',
            width: Math.min(360, window.innerWidth - 16),
          });
        } else {
          // En desktop (sidebar): desplegar hacia arriba desde el botón
          setDropdownStyle({
            position: 'fixed',
            bottom: window.innerHeight - rect.top + 8,
            left: rect.left,
            width: 360,
          });
        }
      }
    }

    handlePosition();
    window.addEventListener('resize', handlePosition);
    return () => window.removeEventListener('resize', handlePosition);
  }, [open, anchorRef, items]);

  if (!open) return null;

  // Cálculo de la altura máxima adaptativa
  const isMobile = window.innerWidth <= 768;
  const maxH = isMobile
    ? window.innerHeight - (anchorRef.current?.getBoundingClientRect().bottom ?? 0) - 24
    : Math.min(
        480,
        window.innerHeight -
          (window.innerHeight - (anchorRef.current?.getBoundingClientRect().top ?? 0)) -
          16,
      );

  return (
    <div
      className="cart-dropdown"
      ref={dropdownRef}
      style={{ ...dropdownStyle, maxHeight: Math.min(480, maxH) }}
    >
      {/* Header del Carrito */}
      <div className="cart-header">
        <span className="cart-header__title text-ellipsis">Turnos Seleccionados</span>
        {items.length > 0 && (
          <button className="cart-header__clear text-ellipsis" onClick={clearCart}>
            Vaciar todo
          </button>
        )}
      </div>

      {/* Lista de Turnos */}
      <div className="cart-list">
        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">🛒</span>
            <p className="text-ellipsis">No tenés turnos en el carrito</p>
          </div>
        ) : (
          items.map((item, index) => {
            const servicioNombre = item.especialidad || item.practica || item.servicio?.nombre || 'Consulta Médica';
            const medicoNombre = item.medico?.nombre || 'Médico General';
            const itemId = item.id || item._id || index; // Fallback al index por seguridad de Key

            return (
              <div key={itemId} className="cart-item">
                <span className="cart-item__icon">📅</span>
                <div className="cart-item__body">
                  <p className="cart-item__service text-ellipsis">{servicioNombre}</p>
                  <p className="cart-item__doctor text-ellipsis">{medicoNombre}</p>
                  <p className="cart-item__meta text-ellipsis">
                    {item.fecha || 'Propuesta'} - {item.hora || '00:00'} hs
                  </p>
                  <p className="cart-item__sede text-ellipsis" style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
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

      {/* Footer con el Total y Botón de Confirmación Único */}
      {items.length > 0 && (
        <div className="cart-footer">
          <div className="cart-footer__total-row">
            <span className="text-ellipsis">Total estimado:</span>
            <span className="cart-footer__price text-ellipsis">
              {totalCosto === 0 ? "Sin costo (Cubierto)" : `$${totalCosto.toLocaleString('es-AR')}`}
            </span>
          </div>
          <button
            className="cart-footer__btn-confirm text-ellipsis"
            onClick={() => {
              setOpen(false);
              if (location.pathname === '/solicitar-turno') {
                window.dispatchEvent(new Event('ir_a_confirmar_turnos'));
              } else {
                navigate('/solicitar-turno', { state: { irAConfirmar: true } });
              }
              // Si pasas la función por props, acá podrías ejecutarla:
              if (onConfirmarReserva) onConfirmarReserva();
            }}
          >
            Confirmar Reserva Masiva ✓
          </button>
        </div>
      )}
    </div>
  );
}
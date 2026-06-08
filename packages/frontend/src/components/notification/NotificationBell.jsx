import React, { useState, useRef, useEffect } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './NotificationBell.css';
import { notificacionesMock } from '@/mockdata/notificaciones';

function inferirIcono(mensaje) {
  const m = mensaje.toLowerCase();
  if (m.includes('cancelado') || m.includes('cancelar')) return '❌';
  if (m.includes('confirmado') || m.includes('confirmada')) return '✅';
  if (m.includes('recordatorio') || m.includes('mañana')) return '⏰';
  if (m.includes('reprogramar') || m.includes('propuesta')) return '🔄';
  if (m.includes('reservado') || m.includes('nuevo turno')) return '📅';
  return '🔔';
}

function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diff / 60000);
  const hs = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  if (hs < 24) return `hace ${hs} h`;
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState(notificacionesMock);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);

  const unread = notifications.filter((n) => !n.leida);
  const unreadCount = unread.length;

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
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
    setOpen((prev) => !prev);
  }

  function markAsRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, leida: true, fechaHoraLeida: new Date() } : n)),
    );
  }

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, leida: true, fechaHoraLeida: new Date() })),
    );
  }

  const isMobile = window.innerWidth <= 768;
  const maxH = isMobile
    ? window.innerHeight - (containerRef.current?.getBoundingClientRect().bottom ?? 0) - 24
    : Math.min(
        480,
        window.innerHeight -
          (window.innerHeight - (containerRef.current?.getBoundingClientRect().top ?? 0)) -
          16,
      );

  return (
    <div className="nb-wrapper" ref={containerRef}>
      <IconButton
        color="inherit"
        aria-label="notificaciones"
        onClick={toggleOpen}
        className={open ? 'nb-btn nb-btn--active' : 'nb-btn'}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {open && (
        <div className="nb-dropdown" style={{ ...dropdownStyle, maxHeight: Math.min(480, maxH) }}>
          <div className="nb-header">
            <span className="nb-header__title">Notificaciones</span>
            {unreadCount > 0 && (
              <button className="nb-header__mark-all" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="nb-list">
            {unread.length === 0 ? (
              <div className="nb-empty">
                <span className="nb-empty__icon">🔕</span>
                <p>No tenés notificaciones sin leer</p>
              </div>
            ) : (
              unread.map((n) => (
                <div
                  key={n._id}
                  className="nb-item nb-item--unread"
                  onClick={() => markAsRead(n._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && markAsRead(n._id)}
                  aria-label="Marcar como leída notificación"
                >
                  <span className="nb-item__icon">{inferirIcono(n.mensaje)}</span>
                  <div className="nb-item__body">
                    <p className="nb-item__message">{n.mensaje}</p>
                    <p className="nb-item__time">{tiempoRelativo(n.fechaHoraCreacion)}</p>
                  </div>
                  <span className="nb-item__dot" aria-hidden="true" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

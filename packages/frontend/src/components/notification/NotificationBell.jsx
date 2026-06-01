import React, { useState, useRef, useEffect } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './NotificationBell.css';
import { notificacionesMock } from '@/mockdata/notificaciones';


// ── Inferir ícono a partir del contenido del mensaje ─────────────────────────
function inferirIcono(mensaje) {
  const m = mensaje.toLowerCase();
  if (m.includes('cancelado') || m.includes('cancelar'))  return '❌';
  if (m.includes('confirmado') || m.includes('confirmada')) return '✅';
  if (m.includes('recordatorio') || m.includes('mañana'))  return '⏰';
  if (m.includes('reprogramar') || m.includes('propuesta')) return '🔄';
  if (m.includes('reservado') || m.includes('nuevo turno')) return '📅';
  return '🔔';
}

// ── Tiempo relativo legible ───────────────────────────────────────────────────
function tiempoRelativo(fecha) {
  const diff = Date.now() - new Date(fecha).getTime();
  const min  = Math.floor(diff / 60000);
  const hs   = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (min  < 1)  return 'ahora';
  if (min  < 60) return `hace ${min} min`;
  if (hs   < 24) return `hace ${hs} h`;
  if (dias === 1) return 'ayer';
  return `hace ${dias} días`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState(notificacionesMock);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const unread = notifications.filter(n => !n.leida);
  const unreadCount = unread.length;

  // Cerrar al hacer click fuera del menú
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
    setOpen(prev => !prev);
  }

  // Marcar una notificación individual como leída
  // → cuando integres el backend: PATCH /notificaciones/:_id/:idUsuario
  function markAsRead(id) {
    setNotifications(prev =>
      prev.map(n =>
        n._id === id
          ? { ...n, leida: true, fechaHoraLeida: new Date() }
          : n
      )
    );
  }

  // Marcar todas como leídas
  function markAllAsRead() {
    setNotifications(prev =>
      prev.map(n => ({ ...n, leida: true, fechaHoraLeida: new Date() }))
    );
  }

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
        <div className="nb-dropdown">
          {/* Encabezado */}
          <div className="nb-header">
            <span className="nb-header__title">Notificaciones</span>
            {unreadCount > 0 && (
              <button className="nb-header__mark-all" onClick={markAllAsRead}>
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="nb-list">
            {unread.length === 0 ? (
              <div className="nb-empty">
                <span className="nb-empty__icon">🔕</span>
                <p>No tenés notificaciones sin leer</p>
              </div>
            ) : (
              unread.map(n => (
                <div
                  key={n._id}
                  className="nb-item nb-item--unread"
                  onClick={() => markAsRead(n._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && markAsRead(n._id)}
                  aria-label={`Marcar como leída notificación`}
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
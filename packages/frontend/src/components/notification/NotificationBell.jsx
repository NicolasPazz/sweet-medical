import React, { useState, useRef, useEffect, useCallback } from 'react';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './NotificationBell.css';
import { useAuth } from '../AuthProvider.jsx';
import {
  getNotificacionesNoLeidas,
  marcarNotificacionLeida,
} from '../../services/userService.js';

const POLL_INTERVAL_MS = 30_000;

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
  const { isAuthenticated, email, password } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [cargando, setCargando] = useState(false);



  const containerRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch de notificaciones no leídas 
  const fetchNotificaciones = useCallback(async () => {
    if (!email || !password) return;
    try {
      const data = await getNotificacionesNoLeidas({ email, password });
      setNotifications(data ?? []);
    } catch (err) {
      console.error('[NotificationBell] Error al obtener notificaciones:', err);
    }
  }, [email, password]);

  // Polling automático mientras esté autenticado
  // fetch inmediato al loguearse + intervalo cada POLL_INTERVAL_MS

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      clearInterval(pollRef.current);
      return;
    }

    // Fetch inmediato apenas isAuthenticated pasa a true
    fetchNotificaciones();

    // Luego cada POLL_INTERVAL_MS
    pollRef.current = setInterval(fetchNotificaciones, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, fetchNotificaciones]);


  if (!isAuthenticated) return null;

  const unreadCount = notifications.length;

  function toggleOpen() {
    if (!open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 8,
          right: 8,
          left: 'auto',
          width: Math.min(360, window.innerWidth - 16),
        });
      } else {
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

  async function markAsRead(notif) {
    const id = notif._id ?? notif.id;
    setNotifications((prev) => prev.filter((n) => (n._id ?? n.id) !== id));
    try {
      await marcarNotificacionLeida({ email, password, idNotificacion: id });
    } catch (err) {
      console.error('[NotificationBell] Error al marcar como leída:', err);
      fetchNotificaciones();
    }
  }

  async function markAllAsRead() {
    if (cargando || notifications.length === 0) return;
    setCargando(true);
    const todas = [...notifications];
    setNotifications([]);
    try {
      await Promise.all(
        todas.map((n) =>
          marcarNotificacionLeida({ email, password, idNotificacion: n._id ?? n.id }),
        ),
      );
    } catch (err) {
      console.error('[NotificationBell] Error al marcar todas como leídas:', err);
      fetchNotificaciones();
    } finally {
      setCargando(false);
    }
  }

  const isMobile = window.innerWidth <= 768;
  const maxH = isMobile
    ? window.innerHeight - (containerRef.current?.getBoundingClientRect().bottom ?? 0) - 24
    : Math.min(
      600,
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
        <div className="nb-dropdown" style={{ ...dropdownStyle, maxHeight: Math.min(600, maxH) }}>
          <div className="nb-header">
            <span className="nb-header__title text-ellipsis">Notificaciones</span>
            {unreadCount > 0 && (
              <button
                className="nb-header__mark-all text-ellipsis"
                onClick={markAllAsRead}
                disabled={cargando}
              >
                {cargando ? 'Marcando...' : 'Marcar todas como leídas'}
              </button>
            )}
          </div>

          <div className="nb-list">
            {unreadCount === 0 ? (
              <div className="nb-empty">
                <span className="nb-empty__icon">🔕</span>
                <p className="text-ellipsis">No tenés notificaciones sin leer</p>
              </div>
            ) : (
              notifications.map((n) => {
                const id = n._id ?? n.id;
                return (
                  <div
                    key={id}
                    className="nb-item nb-item--unread"
                    onClick={() => markAsRead(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && markAsRead(n)}
                    aria-label="Marcar como leída notificación"
                  >
                    <div className="nb-item__body">
                      <p className="nb-item__message">{n.mensaje}</p>
                      <p className="nb-item__time text-ellipsis">
                        {tiempoRelativo(n.fechaHoraCreacion)}
                      </p>
                    </div>
                    <span className="nb-item__dot" aria-hidden="true" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import './HistorialTurnosMedico.css';
import { TURNOS_MEDICO_MOCK } from '../../../mockdata/turnosMedico.js';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import DetalleTurnoMedico from './DetalleTurnoMedico.jsx';
import { getUserByToken } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonTurnoList } from '../../../components/ui/Skeleton.jsx';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function HistorialTurnosMedico() {
  const { isAuthenticated, token } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');
  const [vista, setVista] = useState('LISTADO');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [user, setUser] = useState(null);

  // Simula carga asincrónica del mock (cuando se integre al backend, solo cambia el fetch)
  useEffect(() => {
    const timer = setTimeout(() => {
      setTurnos([...TURNOS_MEDICO_MOCK]);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

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

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (user?.rol !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter((t) => t.estado === filtro);

  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

  const handleConfirmar = (idTurno) => {
    setTurnos((prev) => prev.map((t) => (t._id === idTurno ? { ...t, estado: 'CONFIRMADO' } : t)));
  };

  const handleFinalizar = (idTurno) => {
    setTurnos((prev) => prev.map((t) => (t._id === idTurno ? { ...t, estado: 'REALIZADO' } : t)));
  };

  const handleCancelar = (idTurno, motivo) => {
    setTurnos((prev) =>
      prev.map((t) =>
        t._id === idTurno ? { ...t, estado: 'CANCELADO', motivoCancelacion: motivo } : t,
      ),
    );
    setVista('LISTADO');
  };

  const handleAceptarReprogramacion = (idTurno) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t._id !== idTurno) return t;
        return {
          ...t,
          estado: 'RESERVADO',
          fechaHora: t.propuestaCambio.nuevaFechaHora,
          hora: t.propuestaCambio.nuevaHora,
          propuestaCambio: null,
        };
      }),
    );
  };

  const handleRechazarReprogramacion = (idTurno) => {
    setTurnos((prev) =>
      prev.map((t) => {
        if (t._id !== idTurno) return t;
        return { ...t, estado: 'RESERVADO', propuestaCambio: null };
      }),
    );
  };

  if (vista === 'DETALLE' && turnoSeleccionado) {
    const turnoActualizado = turnos.find((t) => t._id === turnoSeleccionado._id);
    return (
      <DetalleTurnoMedico
        turno={turnoActualizado}
        cfgEstado={
          ESTADO_CONFIG[turnoActualizado.estado] ?? { label: turnoActualizado.estado, color: '' }
        }
        formatFecha={formatFecha}
        onVolver={() => setVista('LISTADO')}
        onConfirmar={() => handleConfirmar(turnoActualizado._id)}
        onCancelar={(motivo) => handleCancelar(turnoActualizado._id, motivo)}
        onAceptarReprogramacion={() => handleAceptarReprogramacion(turnoActualizado._id)}
        onRechazarReprogramacion={() => handleRechazarReprogramacion(turnoActualizado._id)}
      />
    );
  }

  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title text-ellipsis">Turnos del Médico</h1>
        <p className="historial-subtitle text-ellipsis">Historial y próximos turnos de tus pacientes</p>
      </div>

      <div className="filtros">
        {estados.map((e) => (
          <button
            key={e}
            className={`filtro-btn ${filtro === e ? 'activo' : ''} text-ellipsis`}
            onClick={() => setFiltro(e)}
          >
            {e === 'TODOS' ? 'Todos' : ESTADO_CONFIG[e].label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonTurnoList count={5} />
      ) : turnosFiltrados.length === 0 ? (
        <p className="historial-vacio text-ellipsis">No hay turnos para mostrar.</p>
      ) : (
        <ul className="turnos-lista">
          {turnosFiltrados.map((turno) => {
            const cfg = ESTADO_CONFIG[turno.estado] ?? { label: turno.estado, color: '' };
            const esPendiente = turno.estado === 'PENDIENTE_REPROGRAMACION';
            const puedeConfirmar = turno.estado === 'RESERVADO';
            const puedeFinalizar =
              turno.estado === 'CONFIRMADO' && new Date(turno.fechaHora) <= new Date();

            return (
              <li
                key={turno._id}
                className="turno-card"
                onClick={() => handleAbrirDetalle(turno)}
                style={{ cursor: 'pointer' }}
              >
                <div className="turno-card-left">
                  <span className="turno-fecha text-ellipsis">{formatFecha(turno.fechaHora)}</span>
                  <span className="turno-hora text-ellipsis">{turno.hora}</span>
                </div>
                <div className="turno-card-center">
                  <span className="turno-servicio text-ellipsis">{turno.servicio?.nombre}</span>
                  <span className="turno-medico text-ellipsis">{turno.paciente?.nombre}</span>
                  {turno.sede && <span className="turno-sede text-ellipsis">{turno.sede.nombre}</span>}
                  {esPendiente && turno.propuestaCambio && (
                    <span className="turno-propuesta text-ellipsis">
                      → {formatFecha(turno.propuestaCambio.nuevaFechaHora)}{' '}
                      {turno.propuestaCambio.nuevaHora}
                    </span>
                  )}
                </div>
                <div className="turno-card-right">
                  <span className={`turno-estado ${cfg.color} text-ellipsis`}>{cfg.label}</span>
                  <span className="turno-costo text-ellipsis">${turno.costo?.toLocaleString('es-AR')}</span>
                </div>

                {puedeConfirmar && (
                  <button
                    className="btn-confirmar-inline text-ellipsis"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmar(turno._id);
                    }}
                  >
                    ✓ Confirmar
                  </button>
                )}
                {esPendiente && (
                  <div className="btns-reprogramacion-inline" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn-aceptar-inline text-ellipsis"
                      onClick={() => handleAceptarReprogramacion(turno._id)}
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      className="btn-rechazar-inline text-ellipsis"
                      onClick={() => handleRechazarReprogramacion(turno._id)}
                    >
                      ✕ Rechazar
                    </button>
                  </div>
                )}
                {puedeFinalizar && (
                  <button
                    className="btn-finalizar-inline text-ellipsis"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFinalizar(turno._id);
                    }}
                  >
                    ✔ Finalizar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

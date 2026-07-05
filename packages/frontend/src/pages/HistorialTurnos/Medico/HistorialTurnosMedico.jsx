import { useState, useEffect } from 'react';
import './HistorialTurnosMedico.css';
import { TURNOS_MEDICO_MOCK } from '../../../mockdata/turnosMedico.js';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import DetalleTurnoMedico from './DetalleTurnoMedico.jsx';
import { getMe, getTurnosMedico, getSedesMe, getRolUsuario } from '../../../services/userService.js';
import { cancelarTurno, cancelarTurnoMedico, cancelarTurnoPaciente, confirmarTurno, finalizarTurno, proponerReprogramacion, responderReprogramacion } from '../../../services/turnoService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonTurnoList } from '../../../components/ui/Skeleton.jsx';
import VolverGestion from '../../../components/ui/VolverGestion.jsx';
import Toast from '../../../components/Toast/Toast.jsx';
import { useModoVista } from '../../../components/ModoVistaContext.jsx';
import { formatFechaUTC, formatHoraUTC } from '../../../lib/dateTime.js';

function ModalSede({ onConfirmar, onCerrar, email, password }) {
  const [sedes, setSedes] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSedesMe({ email, password })
      .then((data) => setSedes(data ?? []))
      .catch(() => setSedes([]))
      .finally(() => setCargando(false));
  }, []);

  const handleSubmit = () => {
    if (!sedeSeleccionada) { setError(true); return; }
    onConfirmar(sedeSeleccionada);
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-titulo">Confirmar turno</h3>
        <p className="modal-subtitulo">Seleccioná la sede donde se realizará la atención.</p>
        <label className="modal-label">Sede *</label>
        {cargando ? (
          <p style={{ fontSize: 13, color: '#94a3b8' }}>Cargando sedes...</p>
        ) : sedes.length === 0 ? (
          <p style={{ fontSize: 13, color: '#b91c1c' }}>No tenés sedes registradas. Agregá una desde Gestión Médica.</p>
        ) : (
          <select
            className={`modal-input${error ? ' input-error' : ''}`}
            value={sedeSeleccionada}
            onChange={(e) => { setSedeSeleccionada(e.target.value); setError(false); }}
            autoFocus
          >
            <option value="">-- Seleccioná una sede --</option>
            {sedes.map((s) => (
              <option key={s._id ?? s.id} value={s._id ?? s.id}>
                {s.nombre} — {s.direccion}
              </option>
            ))}
          </select>
        )}
        {error && <span className="modal-error">⚠ Debés seleccionar una sede</span>}
        <div className="modal-acciones">
          <button className="btn-cancelar-accion" onClick={onCerrar}>Cancelar</button>
          <button className="btn-confirmar-accion" onClick={handleSubmit} disabled={cargando || sedes.length === 0}>
            ✓ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HistorialTurnosMedico() {
  const { isAuthenticated, email, password } = useAuth();
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TODOS');
  const [vista, setVista] = useState('LISTADO');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [toast, setToast] = useState(null);
  const [turnoAConfirmar, setTurnoAConfirmar] = useState(null);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);
  const { modo } = useModoVista();

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      if (!email || !password) return;
      try {
        console.log("HOLAAAAAA");
        const data = await getTurnosMedico({ email, password });
        setTurnos(data ?? []);
      } catch (err) {
        console.error('Error al cargar turnos:', err);
        setTurnos([...TURNOS_MEDICO_MOCK]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email, password]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setLoadingUser(false);
        return;
      }
      try {
        const data = await getMe({ email, password });
        const roles = data.usuario?.roles ?? [];
        const esMultiRol = roles.includes('PACIENTE') && roles.includes('MEDICO');

        setMultiplesFiltros(esMultiRol);

        if (esMultiRol) {
          // Con múltiples roles no colapsamos a un único "rol": el nav se
          // filtra más abajo según el switch (modo), no según el rol.
          setUser({ roles, nombre: data.perfil?.nombre, id: data.usuario?.id });
        } else {
          setUser({ rol: getRolUsuario(roles), nombre: data.perfil?.nombre, id: data.usuario?.id });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMultiplesFiltros(false);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [email, password, isAuthenticated]);

  if (loadingUser) {
    return (
      <div className="historial-container">
        <SkeletonTurnoList count={5} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  const rolVisible = multiplesFiltros
    ? (modo === 'modo-medico' ? 'Médico' : 'Paciente')
    : user?.rol;

  if (rolVisible !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  // Con quién comparamos el proponente de una propuesta de reprogramación
  // para saber si fue ESTE médico quien la hizo (y por lo tanto debe esperar
  // la respuesta del paciente, en vez de poder aceptar/rechazar su propia
  // propuesta).
  const esPropuestaPropia = (turno) =>
    !!turno.propuestaCambio &&
    String(turno.propuestaCambio.proponenteId) === String(user?.id);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  const turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter((t) => t.estado === filtro);

  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

  const handleConfirmar = async (idTurno, sede) => {
    try {
      await confirmarTurno(idTurno, email, password, sede);
      setTurnos((prev) => prev.map((t) => (t._id === idTurno ? { ...t, estado: 'CONFIRMADO' } : t)));
      mostrarToast('Turno confirmado exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al confirmar el turno', 'error');
    }
  };

  const handleFinalizar = async (idTurno) => {
    try {
      await finalizarTurno(idTurno, email, password);
      setTurnos((prev) => prev.map((t) => (t._id === idTurno ? { ...t, estado: 'REALIZADO' } : t)));
      mostrarToast('Turno finalizado exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al finalizar el turno', 'error');
    }
  };

  const handleCancelar = async (idTurno, motivo) => {
    try {
      if (rolVisible === 'Médico') {
        await cancelarTurnoMedico(idTurno, motivo, email, password);
      }

      setTurnos((prev) =>
        prev.map((t) =>
          t._id === idTurno ? { ...t, estado: 'CANCELADO', motivoCancelacion: motivo } : t,
        ),
      );
      setVista('LISTADO');
      mostrarToast('Turno cancelado exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al cancelar el turno', 'error');
    }
  };

  const handleAceptarReprogramacion = async (idTurno) => {
    try {
      await responderReprogramacion(idTurno, true, email, password);
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
      mostrarToast('Reprogramación aceptada exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al aceptar la reprogramación', 'error');
    }
  };

  const handleRechazarReprogramacion = async (idTurno) => {
    try {
      await responderReprogramacion(idTurno, false, email, password);
      setTurnos((prev) =>
        prev.map((t) => {
          if (t._id !== idTurno) return t;
          return { ...t, estado: 'RESERVADO', propuestaCambio: null };
        }),
      );
      mostrarToast('Reprogramación rechazada');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al rechazar la reprogramación', 'error');
    }
  };

  const handleProponerReprogramacion = async (idTurno, fecha, hora, motivo) => {
    try {
      await proponerReprogramacion(idTurno, fecha, hora, motivo, email, password);

      const [dia, mes, anio] = fecha.split('/').map(Number);
      const [horas, minutos] = hora.split(':').map(Number);
      const nuevaFechaHora = new Date(anio, mes - 1, dia, horas, minutos, 0);

      setTurnos((prev) =>
        prev.map((t) =>
          t._id === idTurno
            ? {
              ...t,
              estado: 'PENDIENTE_REPROGRAMACION',
              propuestaCambio: {
                nuevaFechaHora,
                nuevaHora: hora,
                motivo,
                // Antes no se guardaba quién propuso el cambio en la
                // actualización optimista local (solo se persistía en el
                // backend). Resultándo: hasta el próximo refresh, el propio
                // médico que acababa de proponer la reprogramación veía sus
                // propios botones de Aceptar/Rechazar, porque `proponenteId`
                // era `undefined` y nunca coincidía con `usuarioId`.
                proponenteId: user?.id,
              },
            }
            : t,
        ),
      );
      mostrarToast('Propuesta de reprogramación enviada exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al proponer la reprogramación', 'error');
      throw err;
    }
  };

  if (vista === 'DETALLE' && turnoSeleccionado) {
    const turnoActualizado = turnos.find((t) => t._id === turnoSeleccionado._id);
    return (
      <DetalleTurnoMedico
        turno={turnoActualizado}
        usuarioId={user?.id}
        cfgEstado={
          ESTADO_CONFIG[turnoActualizado.estado] ?? { label: turnoActualizado.estado, color: '' }
        }
        formatFecha={formatFechaUTC}
        onVolver={() => setVista('LISTADO')}
        onConfirmar={(sede) => handleConfirmar(turnoActualizado._id, sede)}
        onCancelar={(motivo) => handleCancelar(turnoActualizado._id, motivo)}
        onAceptarReprogramacion={() => handleAceptarReprogramacion(turnoActualizado._id)}
        onRechazarReprogramacion={() => handleRechazarReprogramacion(turnoActualizado._id)}
        onProponerReprogramacion={(fecha, hora, motivo) =>
          handleProponerReprogramacion(turnoActualizado._id, fecha, hora, motivo)
        }
      />
    );
  }

  return (
    <>
      <div className="historial-container">
        <VolverGestion />
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
                    <span className="turno-fecha text-ellipsis">{formatFechaUTC(turno.fechaHora)}</span>
                    <span className="turno-hora text-ellipsis">{formatHoraUTC(turno.fechaHora)}</span>
                  </div>
                  <div className="turno-card-center">
                    <span className="turno-servicio text-ellipsis">{turno.servicio?.nombre}</span>
                    <span className="turno-medico text-ellipsis">{turno.paciente?.nombre}</span>
                    {turno.sede && <span className="turno-sede text-ellipsis">{turno.sede.nombre}</span>}
                    {esPendiente && turno.propuestaCambio && (
                      <span className="turno-propuesta text-ellipsis">
                        → {formatFechaUTC(turno.propuestaCambio.nuevaFechaHora)}{' '}
                        {turno.propuestaCambio.nuevaHora || formatHoraUTC(turno.propuestaCambio.nuevaFechaHora)}
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
                        setTurnoAConfirmar(turno._id);
                      }}
                    >
                      ✓ Confirmar
                    </button>
                  )}
                  {esPendiente && !esPropuestaPropia(turno) && (
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
                  {esPendiente && esPropuestaPropia(turno) && (
                    <span className="turno-propuesta-espera text-ellipsis" onClick={(e) => e.stopPropagation()}>
                      ⏳ Esperando respuesta del paciente
                    </span>
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
      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
      {turnoAConfirmar && (
        <ModalSede
          email={email}
          password={password}
          onConfirmar={(sede) => {
            handleConfirmar(turnoAConfirmar, sede);
            setTurnoAConfirmar(null);
          }}
          onCerrar={() => setTurnoAConfirmar(null)}
        />
      )}
    </>
  );
}

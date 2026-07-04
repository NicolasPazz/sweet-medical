import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HistorialTurnos.css';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import TurnoCard from '../../../components/TurnoCard/TurnoCard.jsx';
import { getMe, getHistorialPacienteMe, getRolUsuario } from '../../../services/userService.js';
import { cancelarTurno, cancelarTurnoMedico, cancelarTurnoPaciente, proponerReprogramacion } from '../../../services/turnoService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonTurnoList } from '../../../components/ui/Skeleton.jsx';
import DetalleTurno from '../../DetalleTurno/DetalleTurno.jsx';
import ReprogramarTurno from '../../ReprogramarTurno/ReprogramarTurno.jsx';
import { useModoVista } from '../../../components/ModoVistaContext.jsx';
import Toast from '../../../components/Toast/Toast.jsx';
import { formatFechaUTC } from '../../../lib/dateTime.js';

export default function HistorialTurnos() {
  const [filtro, setFiltro] = useState('TODOS');
  const { isAuthenticated, email, password } = useAuth();
  const [vista, setVista] = useState('LISTADO');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);
  const { modo } = useModoVista();
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      if (!email || !password) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        console.log(email + ", " + password);
        const data = await getHistorialPacienteMe({ email, password });
        setTurnos(data?.turnos ?? []);
      } catch (err) {
        console.error('Error al cargar turnos:', err);
        setTurnos([]);
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
          setUser({ roles, nombre: data.perfil?.nombre });
        } else {
          setUser({ rol: getRolUsuario(roles), nombre: data.perfil?.nombre });
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
    ? (modo === 'modo-paciente' ? 'Paciente' : 'Médico')
    : user?.rol;

  if (rolVisible !== 'Paciente') {
    return <ErrorPage type="403" />;
  }

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];

  let turnosFiltrados = null;

  if (turnos) {
    turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter((t) => t.estado === filtro);
  } else {
    turnosFiltrados = null;
  }
  const handleAbrirDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setVista('DETALLE');
  };

  const handleCancelar = async (motivo) => {
    try {
      if (rolVisible === 'Paciente') {
        await cancelarTurnoPaciente(turnoSeleccionado._id, motivo, email, password);
      }
      else if (rolVisible === 'Médico') {
        await cancelarTurnoMedico(turnoSeleccionado._id, motivo, email, password);
      }

      setTurnos((prev) =>
        prev.map((t) =>
          t._id === turnoSeleccionado._id
            ? { ...t, estado: 'CANCELADO', motivoCancelacion: motivo }
            : t,
        ),
      );
      setVista('LISTADO');
      mostrarToast('Turno cancelado exitosamente');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al cancelar el turno', 'error');
    }
  };

  const handleProponerReprogramacion = async (fecha, hora, motivo) => {
    try {
      await proponerReprogramacion(turnoSeleccionado._id, fecha, hora, motivo, email, password);

      const [dia, mes, anio] = fecha.split('/').map(Number);
      const [horas, minutos] = hora.split(':').map(Number);
      const nuevaFechaHora = new Date(anio, mes - 1, dia, horas, minutos, 0);

      setTurnos((prev) =>
        prev.map((t) =>
          t._id === turnoSeleccionado._id
            ? {
              ...t,
              estado: 'PENDIENTE_REPROGRAMACION',
              propuestaCambio: { nuevaFechaHora, nuevaHora: hora, motivo },
            }
            : t,
        ),
      );
      mostrarToast('Propuesta de reprogramación enviada exitosamente');
      setVista('LISTADO');
    } catch (err) {
      mostrarToast(err.response?.data?.message ?? 'Error al enviar la propuesta de reprogramación', 'error');
      throw err;
    }
  };

  if (vista === 'DETALLE') {
    const turnoActualizado = turnos.find((t) => t._id === turnoSeleccionado._id) ?? turnoSeleccionado;
    return (
      <>
        <DetalleTurno
          turno={turnoActualizado}
          cfgEstado={
            ESTADO_CONFIG[turnoActualizado.estado] ?? { label: turnoActualizado.estado, color: '' }
          }
          formatFecha={formatFechaUTC}
          onVolver={() => setVista('LISTADO')}
          onIrAReprogramar={() => setVista('REPROGRAMAR')}
          onCancelar={handleCancelar}
        />
        <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
      </>
    );
  }

  if (vista === 'REPROGRAMAR') {
    return (
      <>
        <ReprogramarTurno
          turno={turnoSeleccionado}
          onVolver={() => setVista('DETALLE')}
          onFinalizar={() => setVista('LISTADO')}
          onEnviarSolicitud={handleProponerReprogramacion}
        />
        <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
      </>
    );
  }

  return (
    <>
      <div className="historial-container">
        <div className="historial-header">
          <h1 className="historial-title text-ellipsis">Mis Turnos</h1>
          <p className="historial-subtitle text-ellipsis">Historial y turnos próximos</p>
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
              return (
                <TurnoCard
                  key={turno._id}
                  turno={turno}
                  cfg={cfg}
                  onClickTurno={handleAbrirDetalle}
                />
              );
            })}
          </ul>
        )}

        <Link to="/solicitar-turno" className="btn-nuevo-turno text-ellipsis">
          + Nuevo turno
        </Link>
      </div>
      <Toast mensaje={toast?.mensaje} tipo={toast?.tipo} />
    </>
  );
}

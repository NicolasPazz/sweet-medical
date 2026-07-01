import { useState, useEffect } from 'react';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import './HistorialPaciente.css';
import { getMe, getRolUsuario, getHistorialPacienteByMedico } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { SkeletonTurnoList } from '../../../components/ui/Skeleton.jsx';
import VolverGestion from '../../../components/ui/VolverGestion.jsx';
import { useModoVista } from '../../../components/ModoVistaContext.jsx';

const spinIcon = <LoadingOutlined style={{ fontSize: 28, color: '#271f92' }} spin />;

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Vista: Listado de turnos del paciente encontrado ─────────────────────
function HistorialPacienteListado({ paciente, turnos, onVolver }) {
  const [filtro, setFiltro] = useState('TODOS');
  const [turnoExpandido, setTurnoExpandido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];
  const turnosFiltrados = filtro === 'TODOS' ? turnos : turnos.filter((t) => t.estado === filtro);

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn text-ellipsis" onClick={onVolver}>
          ← Nueva búsqueda
        </button>
        <h1 className="historial-title text-ellipsis" style={{ marginTop: '15px' }}>
          Historial de {paciente.nombre}
        </h1>
        <p className="historial-subtitle text-ellipsis">
          DNI {paciente.dni} · {paciente.obraSocial} · {paciente.plan}
        </p>
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
        <SkeletonTurnoList count={4} />
      ) : turnosFiltrados.length === 0 ? (
        <p className="historial-vacio text-ellipsis-multiline">
          {turnos.length === 0
            ? 'Este paciente no tiene turnos registrados.'
            : 'No hay turnos con ese estado.'}
        </p>
      ) : (
        <ul className="turnos-lista">
          {turnosFiltrados.map((turno) => {
            const cfg = ESTADO_CONFIG[turno.estado] ?? { label: turno.estado, color: '' };
            const expandido = turnoExpandido === turno.id_turno;
            return (
              <li
                key={turno.id_turno}
                className="turno-card turno-card--clickable"
                onClick={() => setTurnoExpandido(expandido ? null : turno.id_turno)}
              >
                <div className="turno-card-left">
                  <span className="turno-fecha text-ellipsis">{formatFecha(turno.fechaHora)}</span>
                  <span className="turno-hora text-ellipsis">{turno.hora}</span>
                </div>
                <div className="turno-card-center">
                  <span className = "turno-id text-ellipsis"> {turno.id_turno} </span>
                  <span className="turno-servicio text-ellipsis">{turno.servicio}</span>
                  <span className="turno-medico text-ellipsis">{turno.medico}</span>
                  {turno.sede && <span className="turno-sede text-ellipsis">{turno.sede.nombre}</span>}
                </div>
                <div className="turno-card-right">
                  <span className={`turno-estado ${cfg.color} text-ellipsis`}>{cfg.label}</span>
                  <span className="turno-costo text-ellipsis">${turno.costo?.toLocaleString('es-AR')}</span>
                </div>
                <span className="turno-chevron">{expandido ? '▲' : '▼'}</span>

                {expandido && (
                  <div className="turno-historial" onClick={(e) => e.stopPropagation()}>
                    <p className="turno-historial-titulo text-ellipsis">Historial de estados</p>
                    <ul className="turno-historial-lista">
                      {turno.historialTurnos.map((h, i) => {
                        const hCfg = ESTADO_CONFIG[h.estado] ?? { label: h.estado, color: '' };
                        return (
                          <li key={i} className="turno-historial-item">
                            <span className={`turno-estado ${hCfg.color} text-ellipsis`}>{hCfg.label}</span>
                            <span className="turno-historial-fecha text-ellipsis">
                              {formatFecha(h.fechaHoraIngreso)}
                            </span>
                            <span className="turno-historial-motivo text-ellipsis">{h.motivo}</span>
                            <span className="turno-historial-actor text-ellipsis">@{h.actor}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Vista principal: búsqueda por DNI ────────────────────────────────────
export default function HistorialPaciente() {
  const { isAuthenticated, email, password } = useAuth();
  const [dni, setDni] = useState('');
  const [estado, setEstado] = useState('idle');
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);
  const { modo } = useModoVista();

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
            setUser({ roles, nombre: data.perfil?.nombre });
          } else {
            setUser({ rol: getRolUsuario(roles), nombre: data.perfil?.nombre });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setMultiplesFiltros(false);
          setUser(null);
        }
        finally {
          setLoadingUser(false);
        }
      } else {
        setUser(null);
        setMultiplesFiltros(false);
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [email, password]);

  const rolVisible = multiplesFiltros
    ? (modo === 'modo-medico' ? 'Médico' : 'Paciente')
    : user?.rol;

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (loadingUser) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <Spin indicator={spinIcon} />
        <span className="text-ellipsis" style={{ color: '#94a3b8', fontFamily: 'Roboto Mono, monospace', fontSize: 13 }}>
          Cargando...
        </span>
      </div>
    );
  }

  if (rolVisible !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  const handleBuscar = async () => {
    const trimmed = dni.trim();
    if (!trimmed) return;

    console.log(trimmed + "..." + dni);

    setEstado('searching');
    // Simula latencia de búsqueda
    
      try{
      const data = await getHistorialPacienteByMedico({email, password, dni: trimmed});

      console.log(data.data.paciente);

      if (!data.data.paciente) {
        setEstado('not_found');
        setPacienteEncontrado(null);
        setHistorial([]);
        return;
      }
      setPacienteEncontrado(data.data.paciente);
      setHistorial(data.data.turnos);
      setEstado('found');
    } catch(error){
      setError(error.response.data.message);
      setEstado('error');
      setPacienteEncontrado(null);
      setHistorial([]);
      return;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleVolver = () => {
    setEstado('idle');
    setDni('');
    setPacienteEncontrado(null);
    setHistorial([]);
  };

  if (estado === 'found') {
    return (
      <HistorialPacienteListado
        paciente={pacienteEncontrado}
        turnos={historial}
        onVolver={handleVolver}
      />
    );
  }

  return (
    <div className="historial-container">
      <VolverGestion />
      <div className="historial-header">
        <h1 className="historial-title text-ellipsis">Historial de Paciente</h1>
        <p className="historial-subtitle text-ellipsis">
          Ingresá el DNI del paciente para ver su historial de turnos
        </p>
      </div>

      <div className="hp-search-box">
        <div className="hp-search-row">
          <input
            className="hp-input"
            type="text"
            placeholder="Ej: 30123456"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value);
              if (estado === 'not_found') setEstado('idle');
            }}
            onKeyDown={handleKeyDown}
            maxLength={8}
          />
          <button
            className="hp-btn-buscar"
            onClick={handleBuscar}
            disabled={!dni.trim() || estado === 'searching'}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {estado === 'searching' ? (
              <>
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 14, color: '#fff' }} spin />}
                />{' '}
                Buscando...
              </>
            ) : (
              'Buscar'
            )}
          </button>
        </div>

        {estado === 'not_found' && (
          <p className="hp-error text-ellipsis">
            No se encontró ningún paciente con el DNI <strong>{dni}</strong>.
          </p>
        )}

        {estado === 'error' && (
          <p className="hp-error text-ellipsis">
            {error}.
          </p>
        )}
      </div>
    </div>
  );
}

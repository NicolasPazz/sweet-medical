import { useState, useEffect } from 'react';
import {
  especialidadesMock,
  practicasMock,
} from '../../../mockdata/servicios.js';
import { getAllEspecialidadesByMedic, getAllPracticaByMedic, agregarEspecialidadAMedico, agregarPracticaAMedico, eliminarEspecialidadAMedico, eliminarPracticaAMedico } from '../../../services/ServiciosService.js';
import { getEspecialidades, getPracticas } from '../../../services/turnoService.js';
import './GestionServicio.css';
import { getMe, getRolUsuario } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonServicioList } from '../../../components/ui/Skeleton.jsx';
import VolverGestion from '../../../components/ui/VolverGestion.jsx';

const conTipo = (lista, tipo) => lista.map((s) => ({ ...s, tipo }));

// ─── Modal asignar servicio existente ──────────────────────────────────────
function AsignarServicioModal({ onClose, onAsignado, especialidadesUsuario, practicasUsuario }) {
  const [tipo, setTipo] = useState('ESPECIALIDAD');
  const [catalogoServicios, setCatalogoServicios] = useState([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [asignandoId, setAsignandoId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCatalogo = async () => { 
      setLoadingCatalogo(true);
      setError('');
      try {
        const res = tipo === 'ESPECIALIDAD' ? await getEspecialidades() : await getPracticas();
        const lista = res?.data ?? [];
        const serviciosYaAsignados = tipo === 'ESPECIALIDAD' ? especialidadesUsuario : practicasUsuario;
        const idsYaAsignados = new Set(serviciosYaAsignados.map((s) => s.id ?? s._id?.toString()));
        setCatalogoServicios(lista.filter((serv) => !idsYaAsignados.has(serv._id?.toString() ?? serv.id)));
      } catch (e) {
        console.error('Error cargando catálogo:', e);
        setError('No se pudo cargar el catálogo de servicios.');
      } finally {
        setLoadingCatalogo(false);
      }
    };
    cargarCatalogo();
  }, [tipo, especialidadesUsuario, practicasUsuario]);

  const handleAsignar = async (servicio) => {
    const id = servicio._id ?? servicio.id;
    setAsignandoId(id);
    setError('');
    try {
      await onAsignado({
        id,
        tipo,
        nombre: servicio.nombre,
        duracionTurnoEnMins: servicio.duracionTurnoEnMins,
        costo: servicio.costo,
        ...(tipo === 'PRACTICA' && { codigo: servicio.codigo }),
      });
      setCatalogoServicios((prev) => prev.filter((s) => (s._id ?? s.id) !== id));
    } catch (e) {
      setError('No se pudo asignar el servicio. Intentá de nuevo.');
    } finally {
      setAsignandoId(null);
    }
  };

  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title text-ellipsis">➕ Asignarme un servicio</div>

        {error && <div className="gs-error text-ellipsis-multiline">{error}</div>}

        <label className="gs-label text-ellipsis">Tipo de servicio</label>
        <select className="gs-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="ESPECIALIDAD">Especialidad</option>
          <option value="PRACTICA">Práctica</option>
        </select>

        <div className="gs-catalogo-list">
          {loadingCatalogo ? (
            <div className="gs-catalogo-empty text-ellipsis">Cargando...</div>
          ) : catalogoServicios.length === 0 ? (
            <div className="gs-catalogo-empty text-ellipsis">
              No hay servicios disponibles para asignar.
            </div>
          ) : (
            catalogoServicios.map((s) => {
              const id = s._id ?? s.id;
              return (
                <div className="gs-catalogo-item" key={id}>
                  <div className="gs-catalogo-item-info">
                    <div className="gs-catalogo-item-nombre text-ellipsis">{s.nombre}</div>
                    <div className="gs-catalogo-item-meta">
                      <span className="text-ellipsis">⏱ {s.duracionTurnoEnMins} min</span>
                      <span className="text-ellipsis">💲 ${Number(s.costo).toLocaleString('es-AR')}</span>
                      {s.codigo && <span className="text-ellipsis">🔖 {s.codigo}</span>}
                    </div>
                  </div>
                  <button
                    className="gs-btn-edit text-ellipsis"
                    disabled={asignandoId === id}
                    onClick={() => handleAsignar(s)}
                  >
                    {asignandoId === id ? 'Asignando...' : 'Asignarme'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="gs-modal-footer">
          <button className="gs-btn-secondary text-ellipsis" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmar eliminación ───────────────────────────────────────────
function ConfirmDeleteModal({ servicio, onClose, onDeleted }) {
  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title text-ellipsis">🗑️ Eliminar asignación</div>
        <p className="gs-modal-body text-ellipsis-multiline">
          ¿Estás seguro que querés dejar de ofrecer <strong>{servicio.nombre}</strong>? Vas a
          poder volver a asignártelo más adelante si querés.
        </p>
        <div className="gs-modal-footer">
          <button className="gs-btn-secondary text-ellipsis" onClick={onClose}>
            Cancelar
          </button>
          <button className="gs-btn-primary gs-btn-danger text-ellipsis" onClick={onDeleted}>
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de servicio ───────────────────────────────────────────────────
function ServicioCard({ servicio, onDelete }) {
  const badgeClass =
    servicio.tipo === 'ESPECIALIDAD' ? 'gs-badge--especialidad' : 'gs-badge--practica';
  return (
    <div className="gs-card">
      <div className="gs-card-left">
        <div className="gs-card-name text-ellipsis">{servicio.nombre}</div>
        <div className="gs-card-meta">
          <span className={`gs-badge ${badgeClass} text-ellipsis`}>{servicio.tipo}</span>
          <span className="text-ellipsis">⏱ {servicio.duracionTurnoEnMins} min</span>
          <span className="text-ellipsis">💲 ${Number(servicio.costo).toLocaleString('es-AR')}</span>
          {servicio.codigo && <span className="text-ellipsis">🔖 {servicio.codigo}</span>}
        </div>
      </div>
      <div className="gs-card-actions">
        <button className="gs-btn-delete text-ellipsis" onClick={() => onDelete(servicio)}>
          Eliminar asignación
        </button>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div className={`gs-toast gs-toast--${type} text-ellipsis`}>{msg}</div>;
}

// ─── Página principal ──────────────────────────────────────────────────────
export function GestionServicio() {
  const { isAuthenticated, email, password } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [user, setUser] = useState(null);

  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    const fetchUser = async () => {
      if (email && password) {
        try {
          const data = await getMe({ email, password });
          setUser({
            id: data.perfil?._id ?? data.perfil?.id,
            rol: getRolUsuario(data.usuario?.roles),
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoadingUser(false);
        }
      } else {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [email, password]);

  useEffect(() => {
    if (!user) return;
    const normalizar = (item) => ({ ...item, id: item.id ?? item._id?.toString() });
    const cargar = async () => {
      try {
        const [espRes, pracRes] = await Promise.all([
          getAllEspecialidadesByMedic({ email, password }),
          getAllPracticaByMedic({ email, password }),
        ]);
        const esp = espRes ?? [];
        const prac = pracRes ?? [];
        setEspecialidades(esp.map(normalizar));
        setPracticas(prac.map(normalizar));
      } catch (e) {
        console.error('[GestionServicio] Error al cargar servicios:', e);
        setErrorCarga('No se pudieron cargar los servicios.');
        setEspecialidades([...especialidadesMock]);
        setPracticas([...practicasMock]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [user]);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (loadingUser) {
    return null;
  }

  if (user?.rol !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  const mostrarToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const todos = [...conTipo(especialidades, 'ESPECIALIDAD'), ...conTipo(practicas, 'PRACTICA')];
  const serviciosFiltrados = todos.filter((s) => filtro === 'TODOS' || s.tipo === filtro);

  const handleAsignado = async (servicio) => {
    const { tipo, ...sinTipo } = servicio;

    try {
      let statusCode;
      if (tipo === 'ESPECIALIDAD') {
        statusCode = await agregarEspecialidadAMedico({ email, password, especialidad: servicio });
      } else {
        statusCode = await agregarPracticaAMedico({ email, password, practica: servicio });
      }

      if (statusCode === 200) {
        mostrarToast('Servicio asignado con éxito.', 'success');
      } else {
        mostrarToast('Respuesta inesperada del servidor.', 'error');
      }

      if (tipo === 'ESPECIALIDAD') {
        setEspecialidades((prev) => [...prev, sinTipo]);
      } else {
        setPracticas((prev) => [...prev, sinTipo]);
      }
    } catch (error) {
      console.error('Error al asignar el servicio:', error);
      if (error.response) {
        const mensajeBackend = error.response.data?.mensaje || 'Error en los datos enviados.';
        mostrarToast(`Error (${error.response.status}): ${mensajeBackend}`, 'error');
      } else {
        mostrarToast('No se pudo conectar con el servidor. Revisá tu conexión.', 'error');
      }
      throw error;
    }
  };

  const handleDeleted = async () => {
    try {
      const { tipo, id } = modalEliminar;
      let statusCode;
      if (tipo === 'ESPECIALIDAD') {
        statusCode = await eliminarEspecialidadAMedico({ email, password, especialidad: modalEliminar });
      } else {
        statusCode = await eliminarPracticaAMedico({ email, password, practica: modalEliminar });
      }

      if (statusCode === 200) {
        if (tipo === 'ESPECIALIDAD') {
          setEspecialidades((prev) => prev.filter((s) => s.id !== id));
        } else {
          setPracticas((prev) => prev.filter((s) => s.id !== id));
        }
        mostrarToast('Servicio eliminado correctamente.', 'success');
      } else {
        mostrarToast('Error en la eliminación del servicio, intentá más tarde.', 'error');
      }
    } catch (error) {
      if (error.response) {
        const mensajeBackend = error.response.data?.mensaje || 'Error en los datos enviados.';
        mostrarToast(`Error (${error.response.status}): ${mensajeBackend}`, 'error');
      } else {
        mostrarToast('No se pudo conectar con el servidor. Revisá tu conexión.', 'error');
      }
    } finally {
      setModalEliminar(null);
    }
  };

  return (
    <div className="gs-page">
      <div className="gs-container">
        <VolverGestion />
        <div className="gs-header">
          <div>
            <h1 className="gs-title text-ellipsis">Gestión de Servicios</h1>
            <p className="gs-subtitle text-ellipsis">Elegí qué especialidades y prácticas ofrecés.</p>
          </div>
          <button className="gs-btn-primary text-ellipsis" onClick={() => setModalAsignar(true)}>
            + Asignarme servicio
          </button>
        </div>

        {errorCarga && (
          <div
            className="gs-toast gs-toast--error text-ellipsis-multiline"
            style={{ position: 'static', marginBottom: '16px' }}
          >
            ⚠️ {errorCarga}
          </div>
        )}

        <div className="gs-filters">
          {['TODOS', 'ESPECIALIDAD', 'PRACTICA'].map((op) => (
            <button
              key={op}
              className={`gs-filter-btn${filtro === op ? ' active' : ''} text-ellipsis`}
              onClick={() => setFiltro(op)}
            >
              {op === 'TODOS' ? 'Todos' : op === 'ESPECIALIDAD' ? 'Especialidades' : 'Prácticas'}
              {op !== 'TODOS' && (
                <span className="gs-filter-count text-ellipsis">
                  ({(op === 'ESPECIALIDAD' ? especialidades : practicas).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <SkeletonServicioList count={4} />
        ) : serviciosFiltrados.length === 0 ? (
          <div className="gs-empty">
            <div className="gs-empty-icon">🩺</div>
            <div className="text-ellipsis">No hay servicios{filtro !== 'TODOS' ? ` de tipo ${filtro}` : ''} asignados.</div>
          </div>
        ) : (
          serviciosFiltrados.map((serv) => (
            <ServicioCard
              key={serv.id}
              servicio={serv}
              onDelete={setModalEliminar}
            />
          ))
        )}
      </div>

      {modalAsignar && (
        <AsignarServicioModal
          onClose={() => setModalAsignar(false)}
          onAsignado={handleAsignado}
          especialidadesUsuario={especialidades}
          practicasUsuario={practicas}
        />
      )}
      {modalEliminar && (
        <ConfirmDeleteModal
          servicio={modalEliminar}
          onClose={() => setModalEliminar(null)}
          onDeleted={handleDeleted}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

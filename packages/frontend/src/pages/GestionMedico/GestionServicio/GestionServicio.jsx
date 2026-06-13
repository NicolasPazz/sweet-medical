import { useState, useEffect } from 'react';
import {
  especialidadesMock,
  practicasMock,
} from '../../../mockdata/servicios.js';
import { getAllEspecialidadesByMedic, getAllPracticaByMedic, agregarEspecialidadAMedico, agregarPracticaAMedico ,eliminarEspecialidadAMedico, eliminarPracticaAMedico } from '../../../services/ServiciosService.js';
import { getEspecialidades, getPracticas } from '../../../services/turnoService.js';
import './GestionServicio.css';
import { getUserByToken } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonServicioList } from '../../../components/ui/Skeleton.jsx';

const conTipo = (lista, tipo) => lista.map((s) => ({ ...s, tipo }));

const EMPTY_FORM = () => ({
  tipo: 'ESPECIALIDAD',
  nombre: '',
  duracionTurnoEnMins: '',
  costo: '',
  codigo: '',
});

// ─── Modal crear / editar ──────────────────────────────────────────────────
function ServicioModal({ servicio, onClose, onSaved, especialidadesUsuario = [], practicasUsuario = [] }) {
  const esEdicion = !!servicio;
  const [form, setForm] = useState(
    esEdicion
      ? {
        tipo: servicio.tipo,
        nombre: servicio.nombre,
        duracionTurnoEnMins: String(servicio.duracionTurnoEnMins),
        costo: String(servicio.costo),
        codigo: servicio.codigo ?? '',
      }
      : EMPTY_FORM(),
  );
  const [catalogoServicios, setCatalogoServicios] = useState([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [error, setError] = useState('');

  // Al crear: carga el catálogo global según el tipo seleccionado
  useEffect(() => {
    if (esEdicion) return;
    const cargarCatalogo = async () => {
      setLoadingCatalogo(true);
      setCatalogoServicios([]);
      setForm((f) => ({ ...f, servicioId: '', nombre: '', duracionTurnoEnMins: '', costo: '', codigo: '' }));
      try {
        const res = form.tipo === 'ESPECIALIDAD'
          ? await getEspecialidades()
          : await getPracticas();
        const lista = res?.data ?? [];
        const serviciosYaAsignados = form.tipo === 'ESPECIALIDAD' ? especialidadesUsuario : practicasUsuario;
        const idsYaAsignados = new Set(serviciosYaAsignados.map((s) => s.id ?? s._id?.toString()));
        setCatalogoServicios(lista.filter((serv) => !idsYaAsignados.has(serv._id?.toString() ?? serv.id)));
      } catch (e) {
        console.error('Error cargando catálogo:', e);
      } finally {
        setLoadingCatalogo(false);
      }
    };
    cargarCatalogo();
  }, [form.tipo, esEdicion]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Al seleccionar del catálogo, autocompleta los campos
  const handleSeleccionCatalogo = (e) => {
    const id = e.target.value;
    const seleccionado = catalogoServicios.find((s) => String(s._id ?? s.id) === id);
    if (!seleccionado) return;
    setForm((f) => ({
      ...f,
      servicioId: id,
      nombre: seleccionado.nombre,
      duracionTurnoEnMins: String(seleccionado.duracionTurnoEnMins),
      costo: String(seleccionado.costo),
      codigo: seleccionado.codigo ?? '',
    }));
  };

  const tipoFinal = esEdicion ? servicio.tipo : form.tipo;

  const handleSubmit = () => {
    setError('');
    if (!esEdicion && !form.servicioId) return setError('Seleccioná un servicio del catálogo.');
    if (
      !form.duracionTurnoEnMins ||
      !Number.isInteger(Number(form.duracionTurnoEnMins)) ||
      Number(form.duracionTurnoEnMins) <= 0
    )
      return setError('La duración debe ser un entero positivo.');
    if (form.costo === '' || isNaN(Number(form.costo)) || Number(form.costo) < 0)
      return setError('El costo debe ser un número no negativo.');

    const servicioGuardado = {
      id: esEdicion ? servicio.id : form.servicioId,
      tipo: tipoFinal,
      nombre: form.nombre,
      duracionTurnoEnMins: Number(form.duracionTurnoEnMins),
      costo: Number(form.costo),
      ...(tipoFinal === 'PRACTICA' && { codigo: form.codigo }),
    };

    onSaved(servicioGuardado, esEdicion);
  };

  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title">
          {esEdicion ? '✏️ Editar servicio' : '➕ Nuevo servicio'}
        </div>

        {error && <div className="gs-error">{error}</div>}

        {!esEdicion && (
          <>
            <label className="gs-label">Tipo de servicio</label>
            <select className="gs-select" value={form.tipo} onChange={set('tipo')}>
              <option value="ESPECIALIDAD">Especialidad</option>
              <option value="PRACTICA">Práctica</option>
            </select>

            <label className="gs-label">Seleccioná del catálogo</label>
            <select
              className="gs-select"
              value={form.servicioId ?? ''}
              onChange={handleSeleccionCatalogo}
              disabled={loadingCatalogo}
            >
              <option value="" disabled>
                {loadingCatalogo ? 'Cargando...' : 'Elegí un servicio'}
              </option>
              {catalogoServicios.map((s) => (
                <option key={s._id ?? s.id} value={s._id ?? s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </>
        )}

        <label className="gs-label" htmlFor="duracionTurnoInput">Duración del turno (minutos)</label>
        <input
          className="gs-input"
          id="duracionTurnoInput"
          type="number"
          min="1"
          value={form.duracionTurnoEnMins}
          onChange={set('duracionTurnoEnMins')}
          placeholder="Ej: 30"
          readOnly={!esEdicion && !!form.servicioId}
        />

        <label className="gs-label" htmlFor='costoInput'>Costo ($)</label>
        <input
          className="gs-input"
          id="costoInput"
          type="number"
          min="0"
          step="0.01"
          value={form.costo}
          onChange={set('costo')}
          placeholder="Ej: 7000"
          readOnly={!esEdicion && !!form.servicioId}
        />

        {tipoFinal === 'PRACTICA' && form.codigo && (
          <>
            <label className="gs-label" htmlFor='codigoInput'>Código</label>
            <input
              className="gs-input"
              id="codigoInput"
              value={form.codigo}
              disabled
            />
          </>
        )}

        <div className="gs-modal-footer">
          <button className="gs-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="gs-btn-primary" onClick={handleSubmit}>
            {esEdicion ? 'Guardar cambios' : 'Agregar'}
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
        <div className="gs-modal-title">🗑️ Eliminar servicio</div>
        <p className="gs-modal-body">
          ¿Estás seguro que querés eliminar <strong>{servicio.nombre}</strong>? Esta acción no se
          puede deshacer.
        </p>
        <div className="gs-modal-footer">
          <button className="gs-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="gs-btn-primary gs-btn-danger" onClick={onDeleted}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de servicio ───────────────────────────────────────────────────
function ServicioCard({ servicio, onEdit, onDelete }) {
  const badgeClass =
    servicio.tipo === 'ESPECIALIDAD' ? 'gs-badge--especialidad' : 'gs-badge--practica';
  return (
    <div className="gs-card">
      <div className="gs-card-left">
        <div className="gs-card-name">{servicio.nombre}</div>
        <div className="gs-card-meta">
          <span className={`gs-badge ${badgeClass}`}>{servicio.tipo}</span>
          <span>⏱ {servicio.duracionTurnoEnMins} min</span>
          <span>💲 ${Number(servicio.costo).toLocaleString('es-AR')}</span>
          {servicio.codigo && <span>🔖 {servicio.codigo}</span>}
        </div>
      </div>
      <div className="gs-card-actions">
        <button className="gs-btn-edit" onClick={() => onEdit(servicio)}>
          Editar
        </button>
        <button className="gs-btn-delete" onClick={() => onDelete(servicio)}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return <div className={`gs-toast gs-toast--${type}`}>{msg}</div>;
}

// ─── Página principal ──────────────────────────────────────────────────────
export function GestionServicio() {
  const { isAuthenticated, token } = useAuth();
  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);
  const [user, setUser] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await getUserByToken(token);
          setUser(userData);
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
  }, [token]);

  useEffect(() => {
    if (!user) return;
    const normalizar = (item) => ({ ...item, id: item.id ?? item._id?.toString() });
    const cargar = async () => {
      try {
        const [espRes, pracRes] = await Promise.all([getAllEspecialidadesByMedic(user.id), getAllPracticaByMedic(user.id)]);
        const esp = espRes?.data ?? espRes ?? [];
        const prac = pracRes?.data ?? pracRes ?? [];
        setEspecialidades(esp.map(normalizar));
        setPracticas(prac.map(normalizar));
      } catch (e) {
        console.error('[GestionServicio] Error al cargar servicios:', e);
        setErrorCarga('No se pudieron cargar los servicios. Usando datos de ejemplo.');
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

  const handleSaved = async (servicioGuardado, esEdicion) => {
    const { tipo, ...sinTipo } = servicioGuardado;

    try {
      if (!esEdicion) {
        let statusCode;
        if (tipo === 'ESPECIALIDAD') {
          statusCode = await agregarEspecialidadAMedico(servicioGuardado, user.id);
        } else {
          statusCode = await agregarPracticaAMedico(servicioGuardado, user.id);
        }

        if (statusCode === 200) {
          mostrarToast('Servicio agregado con éxito.', 'success');
        } else {
          mostrarToast('Respuesta inesperada del servidor.', 'error');
        }
      } else {
        mostrarToast('Servicio actualizado correctamente.', 'success');
      }

      if (tipo === 'ESPECIALIDAD') {
        setEspecialidades((prev) =>
          esEdicion ? prev.map((s) => (s.id === sinTipo.id ? sinTipo : s)) : [...prev, sinTipo],
        );
      } else {
        setPracticas((prev) =>
          esEdicion ? prev.map((s) => (s.id === sinTipo.id ? sinTipo : s)) : [...prev, sinTipo],
        );
      }

      setModalCrear(false);
      setModalEditar(null);

    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      if (error.response) {
        const mensajeBackend = error.response.data?.mensaje || 'Error en los datos enviados.';
        mostrarToast(`Error (${error.response.status}): ${mensajeBackend}`, 'error');
      } else {
        mostrarToast('No se pudo conectar con el servidor. Revisá tu conexión.', 'error');
      }
    }
  };

  const handleDeleted = async () => {
    try {
      const { tipo, id } = modalEliminar;
      let statusCode;
      if (tipo === 'ESPECIALIDAD') {
        statusCode = await eliminarEspecialidadAMedico(modalEliminar, user.id);
      } else {
        statusCode = await eliminarPracticaAMedico(modalEliminar, user.id);
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
      <div className="gs-header">
        <div>
          <h1 className="gs-title">Gestión de Servicios</h1>
          <p className="gs-subtitle">Administrá tus especialidades y prácticas.</p>
        </div>
        <button className="gs-btn-primary" onClick={() => setModalCrear(true)}>
          + Nuevo servicio
        </button>
      </div>

      {errorCarga && (
        <div
          className="gs-toast gs-toast--error"
          style={{ position: 'static', marginBottom: '16px' }}
        >
          ⚠️ {errorCarga}
        </div>
      )}

      <div className="gs-filters">
        {['TODOS', 'ESPECIALIDAD', 'PRACTICA'].map((op) => (
          <button
            key={op}
            className={`gs-filter-btn${filtro === op ? ' active' : ''}`}
            onClick={() => setFiltro(op)}
          >
            {op === 'TODOS' ? 'Todos' : op === 'ESPECIALIDAD' ? 'Especialidades' : 'Prácticas'}
            {op !== 'TODOS' && (
              <span className="gs-filter-count">
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
          <div>No hay servicios{filtro !== 'TODOS' ? ` de tipo ${filtro}` : ''} registrados.</div>
        </div>
      ) : (
        serviciosFiltrados.map((serv) => (
          <ServicioCard
            key={serv.id}
            servicio={serv}
            onEdit={setModalEditar}
            onDelete={setModalEliminar}
          />
        ))
      )}
    </div>

    {modalCrear && <ServicioModal onClose={() => setModalCrear(false)} onSaved={handleSaved} especialidadesUsuario={especialidades} practicasUsuario={practicas} />}
    {modalEditar && (
      <ServicioModal
        servicio={modalEditar}
        onClose={() => setModalEditar(null)}
        onSaved={handleSaved}
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

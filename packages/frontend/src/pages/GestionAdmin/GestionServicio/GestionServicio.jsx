import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionServicio.css';
import { getEspecialidades, getPracticas } from '../../../services/turnoService.js';
import {
  crearEspecialidadAdmin,
  modificarEspecialidadAdmin,
  eliminarEspecialidadAdmin,
  crearPracticaAdmin,
  modificarPracticaAdmin,
  eliminarPracticaAdmin,
} from '../../../services/ServiciosService.js';
import { getMe, getRolUsuario } from '../../../services/userService.js';
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
function ServicioModal({ servicio, onClose, onSubmit, guardando }) {
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
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const tipoFinal = esEdicion ? servicio.tipo : form.tipo;

  const handleSubmit = () => {
    setError('');

    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    if (
      !form.duracionTurnoEnMins ||
      !Number.isInteger(Number(form.duracionTurnoEnMins)) ||
      Number(form.duracionTurnoEnMins) <= 0
    )
      return setError('La duración debe ser un entero positivo.');
    if (form.costo === '' || isNaN(Number(form.costo)) || Number(form.costo) < 0)
      return setError('El costo debe ser un número no negativo.');
    if (tipoFinal === 'PRACTICA' && !form.codigo.trim())
      return setError('El código es obligatorio para una Práctica.');

    const datos = {
      tipo: tipoFinal,
      nombre: form.nombre.trim(),
      duracionTurnoEnMins: Number(form.duracionTurnoEnMins),
      costo: Number(form.costo),
      ...(tipoFinal === 'PRACTICA' && { codigo: form.codigo.trim() }),
    };

    onSubmit(datos).catch((err) => {
      setError(err?.response?.data?.message ?? 'No se pudo guardar el servicio.');
    });
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
          </>
        )}

        <label className="gs-label">Nombre</label>
        <input
          className="gs-input"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Ej: Cardiología"
        />

        <label className="gs-label">Duración del turno (minutos)</label>
        <input
          className="gs-input"
          type="number"
          min="1"
          value={form.duracionTurnoEnMins}
          onChange={set('duracionTurnoEnMins')}
          placeholder="Ej: 30"
        />

        <label className="gs-label">Costo ($)</label>
        <input
          className="gs-input"
          type="number"
          min="0"
          step="0.01"
          value={form.costo}
          onChange={set('costo')}
          placeholder="Ej: 7000"
        />

        {tipoFinal === 'PRACTICA' && (
          <>
            <label className="gs-label">Código</label>
            <input
              className="gs-input"
              value={form.codigo}
              onChange={set('codigo')}
              placeholder="Ej: ECG-001"
              disabled={esEdicion}
            />
          </>
        )}

        <div className="gs-modal-footer">
          <button className="gs-btn-secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="gs-btn-primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmar eliminación ───────────────────────────────────────────
function ConfirmDeleteModal({ servicio, onClose, onDeleted, eliminando }) {
  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title">🗑️ Eliminar servicio</div>
        <p className="gs-modal-body">
          ¿Estás seguro que querés eliminar <strong>{servicio.nombre}</strong>? Esta acción no se
          puede deshacer.
        </p>
        <div className="gs-modal-footer">
          <button className="gs-btn-secondary" onClick={onClose} disabled={eliminando}>
            Cancelar
          </button>
          <button
            className="gs-btn-primary gs-btn-danger"
            onClick={onDeleted}
            disabled={eliminando}
          >
            {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
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

// ─── Página principal (Admin) ──────────────────────────────────────────────
export function GestionServicioAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');

  const normalizar = (item) => ({ ...item, id: item.id ?? item._id?.toString() });

  useEffect(() => {
    const cargar = async () => {
      try {
        const [espRes, pracRes] = await Promise.all([getEspecialidades(), getPracticas()]);
        const esp = espRes?.data ?? espRes ?? [];
        const prac = pracRes?.data ?? pracRes ?? [];
        setEspecialidades(esp.map(normalizar));
        setPracticas(prac.map(normalizar));
      } catch (e) {
        console.error('[GestionServicioAdmin] Error al cargar servicios:', e);
        setErrorCarga('No se pudieron cargar los servicios.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!isAuthenticated) {
        setLoadingAdmin(false);
        return;
      }
      try {
        const data = await getMe({ email, password });
        setAdmin({
          rol: getRolUsuario(data.usuario?.roles),
          idUsuario: data.usuario?.id,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoadingAdmin(false);
      }
    };
    fetchAdmin();
  }, [email, password, isAuthenticated]);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (loadingAdmin) {
    return (
      <div className="gs-page">
        <div className="gs-container">
          <SkeletonServicioList count={4} />
        </div>
      </div>
    );
  }

  if (admin?.rol !== 'Admin') {
    return <ErrorPage type="403" />;
  }

  const mostrarToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const todos = [...conTipo(especialidades, 'ESPECIALIDAD'), ...conTipo(practicas, 'PRACTICA')];
  const serviciosFiltrados = todos.filter((s) => filtro === 'TODOS' || s.tipo === filtro);

  const handleSubmit = async (datos) => {
    if (!admin?.idUsuario) {
      mostrarToast('No se pudo identificar al usuario administrador.', 'error');
      return;
    }

    setGuardando(true);
    try {
      const { tipo, ...resto } = datos;

      if (modalEditar) {
        // Edición
        if (modalEditar.tipo === 'ESPECIALIDAD') {
          const actualizada = await modificarEspecialidadAdmin({
            email,
            password,
            idUsuario: admin.idUsuario,
            id: modalEditar.id,
            datos: {
              nombre: resto.nombre,
              duracionTurnoEnMins: resto.duracionTurnoEnMins,
              costo: resto.costo,
            },
          });
          setEspecialidades((prev) =>
            prev.map((s) => (s.id === modalEditar.id ? normalizar(actualizada) : s)),
          );
        } else {
          const actualizada = await modificarPracticaAdmin({
            email,
            password,
            idUsuario: admin.idUsuario,
            id: modalEditar.id,
            datos: {
              nombre: resto.nombre,
              duracionTurnoEnMins: resto.duracionTurnoEnMins,
              costo: resto.costo,
            },
          });
          setPracticas((prev) =>
            prev.map((s) => (s.id === modalEditar.id ? normalizar(actualizada) : s)),
          );
        }
        mostrarToast('Servicio actualizado correctamente.');
      } else {
        // Creación
        if (tipo === 'ESPECIALIDAD') {
          const creada = await crearEspecialidadAdmin({
            email,
            password,
            idUsuario: admin.idUsuario,
            nombre: resto.nombre,
            duracionTurnoEnMins: resto.duracionTurnoEnMins,
            costo: resto.costo,
          });
          setEspecialidades((prev) => [...prev, normalizar(creada)]);
        } else {
          const creada = await crearPracticaAdmin({
            email,
            password,
            idUsuario: admin.idUsuario,
            codigo: resto.codigo,
            nombre: resto.nombre,
            duracionTurnoEnMins: resto.duracionTurnoEnMins,
            costo: resto.costo,
          });
          setPracticas((prev) => [...prev, normalizar(creada)]);
        }
        mostrarToast('Servicio creado correctamente.');
      }

      setModalCrear(false);
      setModalEditar(null);
    } finally {
      setGuardando(false);
    }
  };

  const handleDeleted = async () => {
    if (!admin?.idUsuario) {
      mostrarToast('No se pudo identificar al usuario administrador.', 'error');
      return;
    }

    const { tipo, id } = modalEliminar;
    setEliminando(true);
    try {
      if (tipo === 'ESPECIALIDAD') {
        await eliminarEspecialidadAdmin({ email, password, idUsuario: admin.idUsuario, id });
        setEspecialidades((prev) => prev.filter((s) => s.id !== id));
      } else {
        await eliminarPracticaAdmin({ email, password, idUsuario: admin.idUsuario, id });
        setPracticas((prev) => prev.filter((s) => s.id !== id));
      }
      mostrarToast('Servicio eliminado.');
      setModalEliminar(null);
    } catch (err) {
      mostrarToast(err?.response?.data?.message ?? 'No se pudo eliminar el servicio.', 'error');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="gs-page">
      <div className="gs-container">
        <button
          className="gs-btn-secondary"
          style={{ marginBottom: 24 }}
          onClick={() => navigate('/gestion-admin')}
        >
          ← Volver al Panel de Administración
        </button>

        <div className="gs-header">
          <div>
            <h1 className="gs-title">ABM de Servicios</h1>
            <p className="gs-subtitle">Administrá las especialidades y prácticas del sistema.</p>
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

      {modalCrear && (
        <ServicioModal
          onClose={() => setModalCrear(false)}
          onSubmit={handleSubmit}
          guardando={guardando}
        />
      )}
      {modalEditar && (
        <ServicioModal
          servicio={modalEditar}
          onClose={() => setModalEditar(null)}
          onSubmit={handleSubmit}
          guardando={guardando}
        />
      )}
      {modalEliminar && (
        <ConfirmDeleteModal
          servicio={modalEliminar}
          onClose={() => setModalEliminar(null)}
          onDeleted={handleDeleted}
          eliminando={eliminando}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

export default GestionServicioAdmin;

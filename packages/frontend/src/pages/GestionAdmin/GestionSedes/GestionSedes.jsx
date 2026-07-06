import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GestionSedes.css';
import { getSedes } from '../../../services/turnoService.js';
import {
  crearSedeAdmin,
  modificarSedeAdmin,
  eliminarSedeAdmin,
} from '../../../services/ServiciosService.js';
import { getMe, getRolUsuario } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import { SkeletonServicioList } from '../../../components/ui/Skeleton.jsx';

const EMPTY_FORM = () => ({
  nombre: '',
  direccion: '',
});

// ─── Modal crear / editar ──────────────────────────────────────────────────
function SedeModal({ sede, onClose, onSubmit, guardando }) {
  const esEdicion = !!sede;
  const [form, setForm] = useState(
    esEdicion
      ? {
          nombre: sede.nombre,
          direccion: sede.direccion,
        }
      : EMPTY_FORM(),
  );
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = () => {
    setError('');

    if (!form.nombre.trim()) return setError('El nombre es obligatorio.');
    if (!form.direccion.trim()) return setError('La dirección es obligatoria.');

    const datos = {
      nombre: form.nombre.trim(),
      direccion: form.direccion.trim(),
    };

    onSubmit(datos).catch((err) => {
      setError(err?.response?.data?.message ?? 'No se pudo guardar la sede.');
    });
  };

  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title">{esEdicion ? '✏️ Editar sede' : '➕ Nueva sede'}</div>

        {error && <div className="gs-error">{error}</div>}

        <label className="gs-label">Nombre</label>
        <input
          className="gs-input"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Ej: Sede Centro"
        />

        <label className="gs-label">Dirección</label>
        <input
          className="gs-input"
          value={form.direccion}
          onChange={set('direccion')}
          placeholder="Ej: Av. Siempreviva 742"
        />

        <div className="gs-modal-footer">
          <button className="gs-btn-secondary" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="gs-btn-primary" onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear sede'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmar eliminación ───────────────────────────────────────────
function ConfirmDeleteModal({ sede, onClose, onDeleted, eliminando }) {
  return (
    <div className="gs-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gs-modal">
        <div className="gs-modal-title">🗑️ Eliminar sede</div>
        <p className="gs-modal-body">
          ¿Estás seguro que querés eliminar <strong>{sede.nombre}</strong>? Esta acción no se puede
          deshacer.
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

// ─── Tarjeta de sede ────────────────────────────────────────────────────────
function SedeCard({ sede, onEdit, onDelete }) {
  return (
    <div className="gs-card">
      <div className="gs-card-left">
        <div className="gs-card-name">{sede.nombre}</div>
        <div className="gs-card-meta">
          <span>📍 {sede.direccion}</span>
        </div>
      </div>
      <div className="gs-card-actions">
        <button className="gs-btn-edit" onClick={() => onEdit(sede)}>
          Editar
        </button>
        <button className="gs-btn-delete" onClick={() => onDelete(sede)}>
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
export function GestionSedesAdmin() {
  const navigate = useNavigate();
  const { isAuthenticated, email, password } = useAuth();
  const [admin, setAdmin] = useState(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [toast, setToast] = useState(null);

  const normalizar = (item) => ({ ...item, id: item.id ?? item._id?.toString() });

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await getSedes();
        const lista = res?.data ?? res ?? [];
        setSedes(lista.map(normalizar));
      } catch (e) {
        console.error('[GestionSedesAdmin] Error al cargar sedes:', e);
        setErrorCarga('No se pudieron cargar las sedes.');
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

  const handleSubmit = async (datos) => {
    if (!admin?.idUsuario) {
      mostrarToast('No se pudo identificar al usuario administrador.', 'error');
      return;
    }

    setGuardando(true);
    try {
      if (modalEditar) {
        const actualizada = await modificarSedeAdmin({
          email,
          password,
          idUsuario: admin.idUsuario,
          id: modalEditar.id,
          datos,
        });
        setSedes((prev) =>
          prev.map((s) => (s.id === modalEditar.id ? normalizar(actualizada) : s)),
        );
        mostrarToast('Sede actualizada correctamente.');
      } else {
        const creada = await crearSedeAdmin({
          email,
          password,
          idUsuario: admin.idUsuario,
          nombre: datos.nombre,
          direccion: datos.direccion,
        });
        setSedes((prev) => [...prev, normalizar(creada)]);
        mostrarToast('Sede creada correctamente.');
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

    const { id } = modalEliminar;
    setEliminando(true);
    try {
      await eliminarSedeAdmin({ email, password, idUsuario: admin.idUsuario, id });
      setSedes((prev) => prev.filter((s) => s.id !== id));
      mostrarToast('Sede eliminada.');
      setModalEliminar(null);
    } catch (err) {
      mostrarToast(err?.response?.data?.message ?? 'No se pudo eliminar la sede.', 'error');
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
            <h1 className="gs-title">ABM de Sedes</h1>
            <p className="gs-subtitle">Administrá las sedes de atención del sistema.</p>
          </div>
          <button className="gs-btn-primary" onClick={() => setModalCrear(true)}>
            + Nueva sede
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

        {loading ? (
          <SkeletonServicioList count={4} />
        ) : sedes.length === 0 ? (
          <div className="gs-empty">
            <div className="gs-empty-icon">🏥</div>
            <div>No hay sedes registradas.</div>
          </div>
        ) : (
          sedes.map((sede) => (
            <SedeCard
              key={sede.id}
              sede={sede}
              onEdit={setModalEditar}
              onDelete={setModalEliminar}
            />
          ))
        )}
      </div>

      {modalCrear && (
        <SedeModal
          onClose={() => setModalCrear(false)}
          onSubmit={handleSubmit}
          guardando={guardando}
        />
      )}
      {modalEditar && (
        <SedeModal
          sede={modalEditar}
          onClose={() => setModalEditar(null)}
          onSubmit={handleSubmit}
          guardando={guardando}
        />
      )}
      {modalEliminar && (
        <ConfirmDeleteModal
          sede={modalEliminar}
          onClose={() => setModalEliminar(null)}
          onDeleted={handleDeleted}
          eliminando={eliminando}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

export default GestionSedesAdmin;

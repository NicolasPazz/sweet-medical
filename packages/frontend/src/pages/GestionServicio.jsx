import { useState, useEffect } from 'react';
import {
  especialidadesMock,
  practicasMock,
  generarIdEspecialidad,
  generarIdPractica,
} from '../mockdata/servicios.js';
import './GestionServicio.css';

// ─── Persistencia en localStorage ─────────────────────────────────────────
const LS_ESP = 'sm_especialidades';
const LS_PRA = 'sm_practicas';

function cargarDesdeStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [...fallback];
  } catch {
    return [...fallback];
  }
}

function guardarEnStorage(key, valor) {
  try {
    localStorage.setItem(key, JSON.stringify(valor));
  } catch {
    // localStorage lleno o bloqueado: no rompe la app
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
// Agrega `tipo` solo para renderizar; ese campo NO se persiste en los arrays
const conTipo = (lista, tipo) => lista.map((s) => ({ ...s, tipo }));

const EMPTY_FORM = () => ({
  tipo: 'ESPECIALIDAD',
  nombre: '',
  duracionTurnoEnMins: '',
  costo: '',
  codigo: '',
});

// ─── Modal crear / editar ──────────────────────────────────────────────────
function ServicioModal({ servicio, onClose, onSaved }) {
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

    const servicioGuardado = {
      id: esEdicion
        ? servicio.id
        : tipoFinal === 'ESPECIALIDAD'
          ? generarIdEspecialidad()
          : generarIdPractica(),
      tipo: tipoFinal,
      nombre: form.nombre.trim(),
      duracionTurnoEnMins: Number(form.duracionTurnoEnMins),
      costo: Number(form.costo),
      ...(tipoFinal === 'PRACTICA' && { codigo: form.codigo.trim() }),
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
          <button className="gs-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="gs-btn-primary" onClick={handleSubmit}>
            {esEdicion ? 'Guardar cambios' : 'Crear servicio'}
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
  const [especialidades, setEspecialidades] = useState(() =>
    cargarDesdeStorage(LS_ESP, especialidadesMock),
  );
  const [practicas, setPracticas] = useState(() => cargarDesdeStorage(LS_PRA, practicasMock));

  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [toast, setToast] = useState(null);
  const [filtro, setFiltro] = useState('TODOS');

  // Sincroniza localStorage cada vez que cambian los arrays
  useEffect(() => {
    guardarEnStorage(LS_ESP, especialidades);
  }, [especialidades]);
  useEffect(() => {
    guardarEnStorage(LS_PRA, practicas);
  }, [practicas]);

  const mostrarToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const todos = [...conTipo(especialidades, 'ESPECIALIDAD'), ...conTipo(practicas, 'PRACTICA')];
  const serviciosFiltrados = todos.filter((s) => filtro === 'TODOS' || s.tipo === filtro);

  const handleSaved = (servicioGuardado, esEdicion) => {
    // servicioGuardado incluye `tipo` para saber a qué array va;
    // lo removemos antes de persistir porque los arrays del back no lo tienen
    const { tipo, ...sinTipo } = servicioGuardado;

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
    mostrarToast(
      esEdicion ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.',
    );
  };

  const handleDeleted = () => {
    const { tipo, id } = modalEliminar;
    if (tipo === 'ESPECIALIDAD') {
      setEspecialidades((prev) => prev.filter((s) => s.id !== id));
    } else {
      setPracticas((prev) => prev.filter((s) => s.id !== id));
    }
    setModalEliminar(null);
    mostrarToast('Servicio eliminado.');
  };

  return (
    <div className="gs-page">
      <div className="gs-container">
        <div className="gs-header">
          <div>
            <h1 className="gs-title">Gestión de Servicios</h1>
            <p className="gs-subtitle">Administrá las especialidades y prácticas del sistema.</p>
          </div>
          <button className="gs-btn-primary" onClick={() => setModalCrear(true)}>
            + Nuevo servicio
          </button>
        </div>

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

        {serviciosFiltrados.length === 0 ? (
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

      {modalCrear && <ServicioModal onClose={() => setModalCrear(false)} onSaved={handleSaved} />}
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

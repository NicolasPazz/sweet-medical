import { useState, useEffect } from 'react';
import { getMedicos, actualizarDisponibilidad } from '../../../services/turnoService.js';
import './DisponibilidadMedico.css';
import { getUserByToken } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';

const MEDICO_SIMULADO_NOMBRE = 'Dr. Especialista 1';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

const DIAS_LABEL = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

const EMPTY_DISP = () => ({ diaSemana: 'LUNES', horaDesde: '08:00', horaHasta: '12:00' });

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`dm-toast dm-toast--${type}`}>{msg}</div>;
}

function DisponibilidadRow({ disp, index, onChange, onRemove, isEditing }) {
  return (
    <div className="dm-row">
      <select
        className="dm-select"
        value={disp.diaSemana}
        onChange={(e) => onChange(index, 'diaSemana', e.target.value)}
        disabled={!isEditing}
      >
        {DIAS.map((d) => (
          <option key={d} value={d}>
            {DIAS_LABEL[d]}
          </option>
        ))}
      </select>

      <div className="dm-time-group">
        <label className="dm-time-label">Desde</label>
        <input
          className="dm-input"
          type="time"
          value={disp.horaDesde}
          onChange={(e) => onChange(index, 'horaDesde', e.target.value)}
          disabled={!isEditing}
        />
      </div>

      <div className="dm-time-group">
        <label className="dm-time-label">Hasta</label>
        <input
          className="dm-input"
          type="time"
          value={disp.horaHasta}
          onChange={(e) => onChange(index, 'horaHasta', e.target.value)}
          disabled={!isEditing}
        />
      </div>

      {isEditing && (
        <button className="dm-btn-remove" onClick={() => onRemove(index)} title="Eliminar franja">
          ✕
        </button>
      )}
    </div>
  );
}

export default function DisponibilidadMedico() {
  const { isAuthenticated, token } = useAuth();
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getMedicos();
        if (res?.status === 'success') {
          const encontrado = (res.data || []).find((m) => m.nombre === MEDICO_SIMULADO_NOMBRE);
          if (encontrado) {
            setMedico(encontrado);
            setDisponibilidades(encontrado.disponibilidades?.map((d) => ({ ...d })) || []);
          } else {
            setError(`No se encontró el médico "${MEDICO_SIMULADO_NOMBRE}" en el sistema.`);
          }
        }
      } catch (err) {
        console.error('Error al cargar médico:', err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    load();
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

  const handleChange = (index, field, value) => {
    setDisponibilidades((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  const handleAdd = () => {
    setDisponibilidades((prev) => [...prev, EMPTY_DISP()]);
  };

  const handleRemove = (index) => {
    setDisponibilidades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setDisponibilidades(medico?.disponibilidades?.map((d) => ({ ...d })) || []);
    setIsEditing(false);
    setError(null);
  };

  const validate = () => {
    for (const d of disponibilidades) {
      if (!d.diaSemana || !d.horaDesde || !d.horaHasta) {
        return 'Completá todos los campos de cada franja horaria.';
      }
      if (d.horaDesde >= d.horaHasta) {
        return `En ${DIAS_LABEL[d.diaSemana]}: la hora de inicio debe ser anterior a la de fin.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await actualizarDisponibilidad(medico.id_medico, disponibilidades);

      const nuevasDisps = disponibilidades.map((d) => ({ ...d }));
      setMedico((prev) => ({ ...prev, disponibilidades: nuevasDisps }));

      setIsEditing(false);
      setToast({ msg: 'Disponibilidad actualizada correctamente.', type: 'success' });
    } catch (err) {
      console.error('Error al guardar disponibilidad:', err);
      setError(err.response?.data?.message || 'Ocurrió un error al guardar. Intentá nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const disByDay = DIAS.reduce((acc, dia) => {
    const franjas = disponibilidades.filter((d) => d.diaSemana === dia);
    if (franjas.length > 0) acc[dia] = franjas;
    return acc;
  }, {});

  const getInitials = (nombre) =>
    nombre
      .replace('Dr. ', '')
      .replace('Dra. ', '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

  return (
    <div className="dm-page">
      <div className="dm-container">
        <div className="dm-header">
          <h1 className="dm-title">Mi Disponibilidad</h1>
          <p className="dm-subtitle">Consultá y administrá tus horarios de atención.</p>
        </div>

        {loading ? (
          <div className="dm-card">
            <Spinner size="md" text="Cargando disponibilidad..." />
          </div>
        ) : error && !medico ? (
          <div className="dm-card dm-error-card">⚠️ {error}</div>
        ) : medico ? (
          <div className="dm-card">
            <div className="dm-card-header">
              <div className="dm-medico-info">
                <div className="dm-medico-avatar">{getInitials(medico.nombre)}</div>
                <div>
                  <div className="dm-medico-nombre">{medico.nombre}</div>
                  {medico.matricula && (
                    <div className="dm-medico-meta">Matrícula: {medico.matricula}</div>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <button className="dm-btn-edit" onClick={() => setIsEditing(true)}>
                  ✏️ Modificar disponibilidad
                </button>
              ) : (
                <div className="dm-edit-actions">
                  <button className="dm-btn-secondary" onClick={handleCancelEdit} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="dm-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Spinner size="sm" text="Guardando..." inline />
                    ) : (
                      '💾 Guardar cambios'
                    )}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="dm-error">
                ⚠️ {error}
                <button className="dm-error-close" onClick={() => setError(null)}>
                  ✕
                </button>
              </div>
            )}

            {/* Vista de solo lectura */}
            {!isEditing && (
              <div className="dm-readonly-section">
                {disponibilidades.length === 0 ? (
                  <div className="dm-empty">
                    <div className="dm-empty-icon">📅</div>
                    <p>No tenés franjas horarias configuradas.</p>
                    <button className="dm-btn-primary" onClick={() => setIsEditing(true)}>
                      + Agregar disponibilidad
                    </button>
                  </div>
                ) : (
                  <div className="dm-days-grid">
                    {Object.entries(disByDay).map(([dia, franjas]) => (
                      <div key={dia} className="dm-day-card">
                        <div className="dm-day-name">{DIAS_LABEL[dia]}</div>
                        {franjas.map((f, i) => (
                          <div key={i} className="dm-day-franja">
                            🕐 {f.horaDesde} – {f.horaHasta}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vista de edición */}
            {isEditing && (
              <div className="dm-edit-section">
                <div className="dm-edit-header">
                  <span className="dm-edit-hint">
                    {disponibilidades.length === 0
                      ? 'No hay franjas configuradas. Agregá una para comenzar.'
                      : `${disponibilidades.length} franja${disponibilidades.length !== 1 ? 's' : ''} configurada${disponibilidades.length !== 1 ? 's' : ''}`}
                  </span>
                  <button className="dm-btn-add" onClick={handleAdd}>
                    + Agregar franja
                  </button>
                </div>

                <div className="dm-rows">
                  {disponibilidades.length === 0 ? (
                    <div className="dm-empty-edit">
                      No hay franjas. Hacé clic en &quot;+ Agregar franja&quot; para empezar.
                    </div>
                  ) : (
                    disponibilidades.map((d, i) => (
                      <DisponibilidadRow
                        key={i}
                        disp={d}
                        index={i}
                        onChange={handleChange}
                        onRemove={handleRemove}
                        isEditing={isEditing}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

import { useState, useEffect } from 'react';
import './DisponibilidadMedico.css';
import { getMe, getMedicoByUser, actualizarDisponibilidad, getRolUsuario } from '../../../services/userService.js';
import { useAuth } from '../../../components/AuthProvider.jsx';
import ErrorPage from '../../ErrorPage/ErrorPage.jsx';
import Spinner from '../../../components/ui/Spinner.jsx';
import VolverGestion from '../../../components/ui/VolverGestion.jsx';
import { useModoVista } from '../../../components/ModoVistaContext.jsx';

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

// Convierte 'HH:MM' a minutos para comparar
const toMin = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

// Fusiona franjas que se solapan o son contiguas en un mismo día
const normalizarDisponibilidades = (lista) => {
  const porDia = {};

  for (const franja of lista) {
    const dia = franja.diaSemana;
    if (!porDia[dia]) porDia[dia] = [];
    porDia[dia].push({ horaDesde: franja.horaDesde, horaHasta: franja.horaHasta });
  }

  const resultado = [];

  for (const [dia, franjas] of Object.entries(porDia)) {
    // Ordenar por horaDesde
    const ordenadas = [...franjas].sort((a, b) => toMin(a.horaDesde) - toMin(b.horaDesde));

    const fusionadas = [ordenadas[0]];

    for (let i = 1; i < ordenadas.length; i++) {
      const actual = ordenadas[i];
      const ultima = fusionadas[fusionadas.length - 1];

      const desdeActual = toMin(actual.horaDesde);
      const hastaUltima = toMin(ultima.horaHasta);
      const hastaActual = toMin(actual.horaHasta);

      if (desdeActual <= hastaUltima) {
        // Se solapan o son contiguas: fusionar extendiendo el fin si corresponde
        if (hastaActual > hastaUltima) {
          ultima.horaHasta = actual.horaHasta;
        }
        // Si hastaActual <= hastaUltima: la franja actual queda contenida, se descarta
      } else {
        fusionadas.push(actual);
      }
    }

    for (const f of fusionadas) {
      resultado.push({ diaSemana: dia, horaDesde: f.horaDesde, horaHasta: f.horaHasta });
    }
  }

  return resultado;
};

function Toast({ msg, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`dm-toast dm-toast--${type} text-ellipsis`}>{msg}</div>;
}

function DisponibilidadRow({ disp, index, onChange, onRemove, onBlur, isEditing }) {
  return (
    <div className="dm-row" onBlur={onBlur}>
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
        <label className="dm-time-label text-ellipsis">Desde</label>
        <input
          className="dm-input"
          type="time"
          value={disp.horaDesde}
          onChange={(e) => onChange(index, 'horaDesde', e.target.value)}
          disabled={!isEditing}
        />
      </div>

      <div className="dm-time-group">
        <label className="dm-time-label text-ellipsis">Hasta</label>
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
  const { isAuthenticated, email, password } = useAuth();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [medico, setMedico] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);
  const { modo } = useModoVista();

  useEffect(() => {
    const load = async () => {
      if (!email || !password) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await getMedicoByUser({ email, password });
        const medico = res?.data ?? res;
        setMedico(medico);
        
        const disponibilidades = medico?.disponibilidades || [];
        setDisponibilidades(disponibilidades);
      } catch (err) {
        console.error('Error al cargar médico:', err);
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email, password]);

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
      <div className="dm-page">
        <div className="dm-container">
          <div className="dm-card">
            <Spinner size="default" text="Cargando..." />
          </div>
        </div>
      </div>
    );
  }

  if (rolVisible !== 'Médico') {
    return <ErrorPage type="403" />;
  }

  const handleChange = (index, field, value) => {
    setDisponibilidades((prev) => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  // Se llama cuando el usuario termina de editar una franja (onBlur)
  const handleNormalizar = () => {
    setDisponibilidades((prev) => normalizarDisponibilidades(prev));
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
      const normalizadas = normalizarDisponibilidades(disponibilidades);
      await actualizarDisponibilidad({ email, password, disponibilidades: normalizadas });

      setDisponibilidades(normalizadas);
      setMedico((prev) => ({ ...prev, disponibilidades: normalizadas }));

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
        <VolverGestion />
        <div className="dm-header">
          <h1 className="dm-title text-ellipsis">Mi Disponibilidad</h1>
          <p className="dm-subtitle text-ellipsis">Consultá y administrá tus horarios de atención.</p>
        </div>

        {loading ? (
          <div className="dm-card">
            <Spinner size="default" text="Cargando disponibilidad..." />
          </div>
        ) : error && !medico ? (
          <div className="dm-card dm-error-card text-ellipsis-multiline">⚠️ {error}</div>
        ) : medico ? (
          <div className="dm-card">
            <div className="dm-card-header">
              <div className="dm-medico-info">
                <div className="dm-medico-avatar">{getInitials(medico.nombre)}</div>
                <div>
                  <div className="dm-medico-nombre text-ellipsis">{medico.nombre}</div>
                  {medico.matricula && (
                    <div className="dm-medico-meta text-ellipsis">Matrícula: {medico.matricula}</div>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <button className="dm-btn-edit text-ellipsis" onClick={() => setIsEditing(true)}>
                  ✏️ Modificar disponibilidad
                </button>
              ) : (
                <div className="dm-edit-actions">
                  <button className="dm-btn-secondary text-ellipsis" onClick={handleCancelEdit} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="dm-btn-primary text-ellipsis" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <Spinner size="small" text="Guardando..." inline />
                    ) : (
                      '💾 Guardar cambios'
                    )}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="dm-error text-ellipsis-multiline">
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
                    <p className="text-ellipsis">No tenés franjas horarias configuradas.</p>
                    <button className="dm-btn-primary text-ellipsis" onClick={() => setIsEditing(true)}>
                      + Agregar disponibilidad
                    </button>
                  </div>
                ) : (
                  <div className="dm-days-grid">
                    {Object.entries(disByDay).map(([dia, franjas]) => (
                      <div key={dia} className="dm-day-card">
                        <div className="dm-day-name text-ellipsis">{DIAS_LABEL[dia]}</div>
                        {franjas.map((f, i) => (
                          <div key={i} className="dm-day-franja text-ellipsis">
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
                  <span className="dm-edit-hint text-ellipsis">
                    {disponibilidades.length === 0
                      ? 'No hay franjas configuradas. Agregá una para comenzar.'
                      : `${disponibilidades.length} franja${disponibilidades.length !== 1 ? 's' : ''} configurada${disponibilidades.length !== 1 ? 's' : ''}`}
                  </span>
                  <button className="dm-btn-add text-ellipsis" onClick={handleAdd}>
                    + Agregar franja
                  </button>
                </div>

                <div className="dm-rows">
                  {disponibilidades.length === 0 ? (
                    <div className="dm-empty-edit text-ellipsis-multiline">
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
                        onBlur={handleNormalizar}
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

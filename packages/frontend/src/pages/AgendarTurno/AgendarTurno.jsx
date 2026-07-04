import { useState, useEffect, Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getMedicos,
  getEspecialidades,
  getPracticas,
  getPacientes,
  getFechasDisponibles,
  buscarTurnosDisponibles,
  reservarTurno,
  getHistorialPaciente,
  getHistorialPacienteMe,
} from '../../services/turnoService';
import { useCart } from '../../context/CartContext.jsx';
import MiniCalendar from './components/MiniCalendar';
import PreselSidebar from './components/PreselSidebar';
import Spinner from '../../components/ui/Spinner.jsx';
import { getMe, getRolUsuario } from '../../services/userService.js';
import { useAuth } from '../../components/AuthProvider.jsx';
import ErrorPage from '../ErrorPage/ErrorPage.jsx';
import './AgendarTurno.css';
import { useModoVista } from '../../components/ModoVistaContext.jsx';

// Importamos íconos para mejorar la UI visualmente
import { FaSearch, FaUserMd, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Meta información dinámica para especialidades y prácticas
const SERVICE_META = {
  Cardiología: { icon: '🫀', color: '#FEE2E2' },
  Pediatría: { icon: '🧒', color: '#FEF9C3' },
  Dermatología: { icon: '🩺', color: '#F0FDF4' },
  Kinesiología: { icon: '💪', color: '#EFF6FF' },
  Oftalmología: { icon: '👁️', color: '#FAF5FF' },
  Traumatología: { icon: '🦴', color: '#FFF7ED' },
  Gastroenterología: { icon: '🔬', color: '#F0FDF4' },
  Neurología: { icon: '🧠', color: '#FDF4FF' },
  Odontología: { icon: '🦷', color: '#F0F9FF' },
  Psiquiatría: { icon: '🧘', color: '#FDF2F8' },
  'Clínica General': { icon: '🏥', color: '#ECFDF5' },
  Ginecología: { icon: '💜', color: '#FAF5FF' },
};

const getServiceMeta = (name) => {
  return SERVICE_META[name] || { icon: '🩺', color: '#E6F4F5' };
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.replace('Dr. ', '').replace('Dra. ', '').split(' ');
  return parts
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

export default function AgendarTurno() {
  const { items: cartItems, addTurn, removeTurn, clearCart } = useCart();
  const location = useLocation();
  const { isAuthenticated, email, password } = useAuth();
  const { modo } = useModoVista();
  const [multiplesFiltros, setMultiplesFiltros] = useState(false);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (email && password) {
        try {
          const data = await getMe({ email, password });
          const roles = data.usuario?.roles ?? [];
          const esMultiRol = roles.includes('PACIENTE') && roles.includes('MEDICO');

          setMultiplesFiltros(esMultiRol);
          const dni = data.usuario.dni;

          if (esMultiRol) {
            setUser({ dni, roles });
          } else {
            setUser({ dni, rol: getRolUsuario(roles) });
          }

          handleSelectPaciente(data.usuario);

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

  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [step, setStep] = useState(0);
  const [searchMode, setSearchMode] = useState('ESPECIALIDAD');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMedico, setSelectedMedico] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotFilter, setSlotFilter] = useState('todos');
  const [docSearch, setDocSearch] = useState('');

  const [historialCitas, setHistorialCitas] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [reservaExitoData, setReservaExitoData] = useState([]);

  const steps = [
    { n: 1, label: 'Paso 1', name: 'Servicio' },
    { n: 2, label: 'Paso 2', name: 'Médico' },
    { n: 3, label: 'Paso 3', name: 'Fecha' },
    { n: 4, label: 'Paso 4', name: 'Horario' },
    { n: 5, label: 'Paso 5', name: 'Confirmar' },
  ];

  useEffect(() => {
    const loadEspecialidades = async () => {
      try {
        const res = await getEspecialidades();
        if (res?.status === 'success') setEspecialidades(res.data || []);
      } catch (err) {
        console.error('Error al cargar especialidades:', err);
      }
    };

    const loadPracticas = async () => {
      try {
        const res = await getPracticas();
        if (res?.status === 'success') setPracticas(res.data || []);
      } catch (err) {
        console.error('Error al cargar prácticas:', err);
      }
    };

    const loadMedicos = async () => {
      try {
        const res = await getMedicos();
        if (res?.status === 'success') setMedicos(res.data || []);
      } catch (err) {
        console.error('Error al cargar médicos:', err);
      }
    };

    loadEspecialidades();
    loadPracticas();
    loadMedicos();
  }, []);

  const cargarHistorial = async () => {
    setLoadingHistorial(true);
    try {
      const res = await getHistorialPacienteMe({ email, password });
      setHistorialCitas(Array.isArray(res.turnos) ? res.turnos : []);
    } catch (err) {
      console.error('Error cargando historial de citas:', err);
      setHistorialCitas([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const handleSelectPaciente = (pac) => {
    setSelectedPaciente(pac);
    cargarHistorial();
    setStep(1);
    clearCart();
    setSelectedService(null);
    setSelectedMedico(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);
  };

  useEffect(() => {
    if (step < 3 || !selectedService || !email || !password) return;

    const fetchDates = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchMode === 'ESPECIALIDAD') {
          params.especialidad = selectedService._id;
        } else {
          params.practica = selectedService._id;
        }
        if (selectedMedico) {
          params.profesionalId = selectedMedico.id_medico;
        }

        const res = await getFechasDisponibles(params, email, password);
        if (res?.status === 'success') {
          setAvailableDates(res.data || []);
        }
      } catch (err) {
        console.error('Error al obtener fechas disponibles:', err);
        setError('No se pudieron obtener las fechas disponibles.');
      } finally {
        setLoading(false);
      }
    };

    fetchDates();
  }, [selectedService, selectedMedico, step, email, password]);

  useEffect(() => {
    if (step < 4 || !selectedDate || !selectedService || !selectedPaciente || !email || !password) return;

    const fetchSlots = async () => {
      setLoading(true);
      try {
        const params = {
          fechaDesde: selectedDate,
          fechaHasta: selectedDate,
          pacienteId: selectedPaciente.id_paciente,
          // Este paso ya viene acotado a UN solo día (fechaDesde === fechaHasta).
          // Sin este límite explícito, /turnos/disponibles usa el default de
          // paginación (limit=10), cortando la grilla de horarios a mitad de
          // camino aunque el médico tenga disponibilidad para más turnos ese día.
          limit: 200,
        };

        if (searchMode === 'ESPECIALIDAD') {
          params.especialidad = selectedService._id;
        } else {
          params.practica = selectedService._id;
        }

        if (selectedMedico) {
          params.profesionalId = selectedMedico.id_medico;
        }

        const res = await buscarTurnosDisponibles(params, email, password);
        if (res?.status === 'success') {
          setSlots(res.data || []);
        }
      } catch (err) {
        console.error('Error al obtener slots de turnos:', err);
        setError('No se pudieron obtener los horarios disponibles.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDate, selectedService, selectedMedico, step, selectedPaciente, email, password]);

  useEffect(() => {
    const irAlPasoConfirmacion = () => setStep(5);
    window.addEventListener('ir_a_confirmar_turnos', irAlPasoConfirmacion);
    return () => window.removeEventListener('ir_a_confirmar_turnos', irAlPasoConfirmacion);
  }, []);

  useEffect(() => {
    if (location.state?.irAConfirmar && cartItems.length > 0) {
      setStep(5);
    }
  }, [location.state]);

  if (!isAuthenticated) {
    return <ErrorPage type="401" />;
  }

  if (loadingUser) {
    return (
      <div className="agendar-container">
        <Spinner size="large" text="Cargando..." />
      </div>
    );
  }

  if (rolVisible !== 'Paciente') {
    return <ErrorPage type="403" />;
  }

  const medicosFiltrados = medicos.filter((m) => {
    const queryTerm = docSearch.toLowerCase();
    const matchesName = m.nombre.toLowerCase().includes(queryTerm);

    if (!selectedService) return matchesName;

    const listaServicios = searchMode === 'ESPECIALIDAD' ? m.especialidades : m.practicas;
    const matchesService = listaServicios?.some(
      (s) => String(s._id || s) === String(selectedService._id),
    );

    return matchesName && matchesService;
  });

  const handleEditarTurno = (itemToEdit, targetStep) => {
    removeTurn(itemToEdit.id);
    if (itemToEdit.id_servicio_seleccionado) {
      setSelectedService({
        _id: itemToEdit.id_servicio_seleccionado,
        nombre: itemToEdit.especialidad || itemToEdit.practica,
      });
      setSearchMode(itemToEdit.especialidad ? 'ESPECIALIDAD' : 'PRACTICA');
    }

    setSelectedMedico(itemToEdit.medico || null);
    setSelectedDate(itemToEdit.fecha || null);
    setSelectedSlot(null);

    setStep(targetStep);
  };

  const handleConfirmReservation = async () => {
    if (cartItems.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const promesas = cartItems.map((item) => {
        const slotsIds = item.id.replace('virtual_', '').split('_');
        const dataReserva = {
          id_usuario: selectedPaciente.id_usuario,
          id_servicio: item.id_servicio_seleccionado || selectedService._id,
          slotsIds: slotsIds,
        };
        return reservarTurno(dataReserva, email, password);
      });
      await Promise.all(promesas);

      setReservaExitoData([...cartItems]);
      setConfirmed(true);
      setStep(5);
      clearCart();
      cargarHistorial();
    } catch (err) {
      console.error('Error al realizar la reserva:', err);
      setError(
        err.response?.data?.message ||
        'Ocurrió un error al reservar el turno. Verifique los parámetros.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setConfirmed(false);
    setSelectedService(null);
    setSelectedMedico(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setSlots([]);
    setReservaExitoData([]);
    clearCart();
    setError(null);
  };

  if (confirmed && step === 5) {
    return (
      <div className="agendar-container">
        <div className="card">
          <div className="success-screen">
            <div className="success-icon"><FaCheckCircle color="#fff" /></div>
            <h2>¡Turno(s) Confirmado(s)!</h2>
            <p className="wizard-subtitle">
              Tus reservas han sido procesadas exitosamente para el paciente{' '}
              <strong>{selectedPaciente?.nombre}</strong>.
            </p>

            <div className="ticket">
              {reservaExitoData.map((t, idx) => (
                <div key={t.id || idx} className="ticket-item">
                  <div className="ticket-header-label">Turno #{idx + 1}</div>
                  <div className="ticket-row">
                    <span className="ticket-label">Servicio</span>
                    <span className="ticket-val">{t.especialidad || t.practica}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">Médico</span>
                    <span className="ticket-val">{t.medico?.nombre}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">Fecha</span>
                    <span className="ticket-val">{t.fecha}</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">Hora</span>
                    <span className="ticket-val">{t.hora} hs</span>
                  </div>
                  <div className="ticket-row">
                    <span className="ticket-label">Sede</span>
                    <span className="ticket-val">{t.sede?.nombre || 'No especificada'}</span>
                  </div>
                  {t.costoEstimado !== undefined && (
                    <div className="ticket-row">
                      <span className="ticket-label">Costo Estimado</span>
                      <span className="ticket-val highlight-cost">
                        {t.costoEstimado === 0 ? 'Sin costo (Cubierto)' : `$${t.costoEstimado}`}
                      </span>
                    </div>
                  )}
                  {idx < reservaExitoData.length - 1 && <div className="ticket-divider" />}
                </div>
              ))}
            </div>

            <div className="success-actions">
              <button className="btn btn-primary" onClick={handleReset}>
                Solicitar otro turno
              </button>
            </div>
          </div>
        </div>

        {selectedPaciente && (
          <HistorialSection historial={historialCitas} loadingHistorial={loadingHistorial} paciente={selectedPaciente} />
        )}
      </div>
    );
  }

  return (
    <div className="agendar-container">
      <header className="agendar-wizard-header">
        <h1 className="agendar-wizard-title">Agendar Cita Médica</h1>
      </header>

      {!isAuthenticated ? (
        <div className="card">
          <div className="card-body no-patient-selected">
            <div className="no-patient-icon"><FaExclamationCircle /></div>
            <h3>Sesión no iniciada</h3>
          </div>
        </div>
      ) : (
        <>
          {/* Stepper */}
          <div className="stepper">
            {steps.map((s, idx) => {
              const isCompleted = step > s.n;
              const isActive = step === s.n;
              return (
                <Fragment key={s.n}>
                  <div className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'done' : ''}`}>
                    <div className="step-circle">{isCompleted ? '✓' : s.n}</div>
                    <div className="step-info">
                      <div className="step-label text-ellipsis">{s.label}</div>
                      <div className="step-name text-ellipsis">{s.name}</div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`step-connector ${isCompleted ? 'done' : ''}`} />
                  )}
                </Fragment>
              );
            })}
          </div>

          {error && (
            <div className="error-alert">
              <span>⚠️ {error}</span>
              <button className="close-alert-btn" onClick={() => setError(null)}>✕</button>
            </div>
          )}

          {/* ══ PASO 1: Servicio ══ */}
          {step === 1 && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-icon"><FaSearch /></div>
                <div>
                  <h2>¿Qué servicio médico necesitás?</h2>
                  <p className="wizard-subtitle">
                    Seleccioná si buscás una especialidad clínica o una práctica médica concreta
                  </p>
                </div>
              </div>
              <div className="card-body">
                <div className="search-mode-tabs">
                  <button
                    className={`tab-btn ${searchMode === 'ESPECIALIDAD' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchMode('ESPECIALIDAD');
                      setSelectedService(null);
                    }}
                  >
                    Especialidades
                  </button>
                  <button
                    className={`tab-btn ${searchMode === 'PRACTICA' ? 'active' : ''}`}
                    onClick={() => {
                      setSearchMode('PRACTICA');
                      setSelectedService(null);
                    }}
                  >
                    Prácticas Médicas
                  </button>
                </div>

                <div className="services-grid">
                  {(searchMode === 'ESPECIALIDAD' ? especialidades : practicas).map((serv) => {
                    const meta = getServiceMeta(serv.nombre);
                    const isSelected = selectedService?._id === serv._id;
                    return (
                      <div
                        key={serv._id}
                        className={`service-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedService(serv)}
                      >
                        <div className="service-icon" style={{ backgroundColor: meta.color }}>
                          {meta.icon}
                        </div>
                        <div className="service-name">{serv.nombre}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="btn-row">
                  <span />
                  <button
                    className="btn btn-primary"
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                  >
                    Continuar con {selectedService?.nombre || '...'} →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ PASO 2: Médico ══ */}
          {step === 2 && (
            <div className="wizard-layout-two-columns">
              <div className="card">
                <div className="card-header">
                  <div className="card-header-icon"><FaUserMd /></div>
                  <div>
                    <h2>Selección de Profesional</h2>
                    <p className="wizard-subtitle">Filtros aplicados para: {selectedService?.nombre}</p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="search-wrap">
                    <span className="search-icon"><FaSearch /></span>
                    <input
                      className="search-input"
                      placeholder="Buscar médico por nombre..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                    />
                  </div>

                  <div className="doc-list">
                    <div
                      className={`doc-card ${selectedMedico === null ? 'selected' : ''}`}
                      onClick={() => setSelectedMedico(null)}
                    >
                      <div className="doc-avatar">★</div>
                      <div className="doc-info">
                        <div className="doc-name">Cualquier Profesional</div>
                        <div className="doc-spec">Asignación al primer médico libre disponible</div>
                      </div>
                      <div className="doc-arrow">›</div>
                    </div>

                    {medicosFiltrados.map((doc) => {
                      const isSelected = selectedMedico?.id_medico === doc.id_medico;
                      const initials = getInitials(doc.nombre);
                      const sedeFisica = doc.sedes?.[0]?.nombre || 'No especificada';

                      return (
                        <div
                          key={doc.id_medico}
                          className={`doc-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => setSelectedMedico(doc)}
                        >
                          <div className="doc-avatar">{initials}</div>
                          <div className="doc-info">
                            <div className="doc-name">{doc.nombre}</div>
                            <div className="doc-spec">Matrícula: {doc.matricula || 'N/A'}</div>
                            <div className="doc-meta">
                              <span className="doc-meta-item">📍 Sede: {sedeFisica}</span>
                            </div>
                          </div>
                          <div className="doc-arrow">›</div>
                        </div>
                      );
                    })}

                    {medicosFiltrados.length === 0 && (
                      <div className="empty-results">
                        No se encontraron profesionales que ofrezcan este servicio.
                      </div>
                    )}
                  </div>

                  <div className="btn-row">
                    <button className="btn btn-ghost" onClick={() => setStep(1)}>← Volver</button>
                    <button className="btn btn-primary" onClick={() => setStep(3)}>Ver Disponibilidad →</button>
                  </div>
                </div>
              </div>

              <PreselSidebar onConfirm={() => setStep(5)} />
            </div>
          )}

          {/* ══ PASO 3: Fecha ══ */}
          {step === 3 && (
            <div className="wizard-layout-two-columns">
              <div className="card">
                <div className="card-header">
                  <div className="card-header-icon"><FaCalendarAlt /></div>
                  <div>
                    <h2>Seleccioná la Fecha</h2>
                    <p className="wizard-subtitle">Los días con punto azul tienen turnos disponibles</p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mini-preview-panel">
                    <div className="preview-avatar">
                      {selectedMedico ? getInitials(selectedMedico.nombre) : '★'}
                    </div>
                    <div className="preview-details">
                      <div className="preview-name">
                        {selectedMedico ? selectedMedico.nombre : 'Cualquier Profesional'}
                      </div>
                      <div className="preview-sub">
                        {selectedService?.nombre}{' '}
                        {selectedMedico?.sedes?.[0]?.nombre
                          ? `· Sede: ${selectedMedico.sedes[0].nombre}`
                          : ''}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>
                      Cambiar
                    </button>
                  </div>

                  {loading ? (
                    <Spinner size="default" text="Cargando disponibilidad..." />
                  ) : (
                    <MiniCalendar
                      selectedDate={selectedDate}
                      onSelectDate={(date) => {
                        setSelectedDate(date);
                        setStep(4);
                      }}
                      availableDates={availableDates}
                    />
                  )}

                  <div className="btn-row">
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>← Volver</button>
                    <button
                      className="btn btn-primary"
                      disabled={!selectedDate}
                      onClick={() => setStep(4)}
                    >
                      Ver Horarios →
                    </button>
                  </div>
                </div>
              </div>

              <PreselSidebar onConfirm={() => setStep(5)} />
            </div>
          )}

          {/* ══ PASO 4: Horario ══ */}
          {step === 4 && (
            <div className="wizard-layout-two-columns">
              <div className="card">
                <div className="card-header">
                  <div className="card-header-icon"><FaClock /></div>
                  <div>
                    <h2>Horarios Disponibles</h2>
                    <p className="wizard-subtitle">
                      Fecha seleccionada: {selectedDate} ·{' '}
                      {selectedMedico ? selectedMedico.nombre : 'Cualquier médico'}
                    </p>
                  </div>
                </div>
                <div className="card-body">
                  <div className="filter-bar">
                    <button
                      className={`filter-chip ${slotFilter === 'todos' ? 'active' : ''}`}
                      onClick={() => setSlotFilter('todos')}
                    >
                      Todos
                    </button>
                    <button
                      className={`filter-chip ${slotFilter === 'presencial' ? 'active' : ''}`}
                      onClick={() => setSlotFilter('presencial')}
                    >
                      Presencial
                    </button>
                    <button
                      className={`filter-chip ${slotFilter === 'telemedicina' ? 'active' : ''}`}
                      onClick={() => setSlotFilter('telemedicina')}
                    >
                      Telemedicina
                    </button>
                  </div>

                  {loading ? (
                    <Spinner size="default" text="Consultando horarios disponibles..." />
                  ) : (
                    <>
                      <div className="slots-grid">
                        {slots
                          .filter((s) => {
                            const isTele = s.modalidad === 'TELEMEDICINA' || s.telemedicina;
                            if (slotFilter === 'presencial') return !isTele;
                            if (slotFilter === 'telemedicina') return isTele;
                            return true;
                          })
                          .map((slot) => {
                            const isSelected = selectedSlot?.id === slot.id;
                            const isTele = slot.modalidad === 'TELEMEDICINA' || slot.telemedicina;
                            return (
                              <button
                                key={slot.id}
                                className={`slot-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                <span className="slot-time">{slot.hora} hs</span>
                                <span className="slot-type">
                                  {isTele ? 'Telemedicina' : 'Presencial'}
                                </span>
                                <span className="slot-sede-tag">{slot.sede?.nombre || 'Sede'}</span>
                              </button>
                            );
                          })}
                      </div>

                      {slots.length === 0 && (
                        <div className="empty-results">
                          No hay turnos disponibles para esta fecha con el profesional seleccionado.
                        </div>
                      )}

                      {selectedSlot && (
                        <div className="slot-alert-info">
                          <FaCheckCircle style={{ marginRight: '8px' }} />
                          Turno seleccionado:{' '}
                          <strong>
                            {selectedSlot.hora} hs (
                            {selectedSlot.modalidad ||
                              (selectedSlot.telemedicina ? 'Telemedicina' : 'Presencial')}
                            )
                          </strong>{' '}
                          en <strong>{selectedSlot.sede?.nombre}</strong>. Costo estimado:{' '}
                          <strong>
                            {selectedSlot.costoEstimado === 0
                              ? 'Sin Costo (Cubierto)'
                              : `$${selectedSlot.costoEstimado}`}
                          </strong>
                          .
                        </div>
                      )}
                    </>
                  )}

                  <div className="btn-row">
                    <button className="btn btn-ghost" onClick={() => setStep(3)}>← Volver</button>
                    <div className="actions-group" style={{ display: 'flex', gap: '10px' }}>
                      {selectedSlot && (
                        <button
                          className="btn btn-ghost"
                          style={{ border: '1px solid #cbd5e1' }}
                          onClick={() => {
                            if (!cartItems.some((i) => i.id === selectedSlot.id)) {
                              addTurn({
                                ...selectedSlot,
                                especialidad: searchMode === 'ESPECIALIDAD' ? selectedService.nombre : null,
                                practica: searchMode === 'PRACTICA' ? selectedService.nombre : null,
                                medico: selectedSlot.medico || selectedMedico,
                                id_servicio_seleccionado: selectedService._id,
                              });
                            }
                            setSelectedSlot(null);
                            setStep(1);
                            setSelectedService(null);
                            setSelectedMedico(null);
                            setSelectedDate(null);
                            setSlots([]);
                          }}
                        >
                          ➕ Sumar turno y buscar otro
                        </button>
                      )}

                      <button
                        className="btn btn-primary"
                        disabled={!selectedSlot && cartItems.length === 0}
                        onClick={() => {
                          if (selectedSlot && !cartItems.some((i) => i.id === selectedSlot.id)) {
                            addTurn({
                              ...selectedSlot,
                              especialidad: searchMode === 'ESPECIALIDAD' ? selectedService.nombre : null,
                              practica: searchMode === 'PRACTICA' ? selectedService.nombre : null,
                              medico: selectedSlot.medico || selectedMedico,
                              id_servicio_seleccionado: selectedService._id,
                            });
                          }
                          setSelectedSlot(null);
                          setStep(5);
                        }}
                      >
                        Ir a Confirmación →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="right-panel-group">
                <div className="doc-detail-card">
                  <div className="doc-detail-header">
                    <div className="doc-detail-avatar">
                      {selectedMedico ? getInitials(selectedMedico.nombre) : '★'}
                    </div>
                    <div className="doc-detail-info">
                      <div className="doc-detail-name">
                        {selectedMedico ? selectedMedico.nombre : 'Cualquier Profesional'}
                      </div>
                      <div className="doc-detail-spec">{selectedService?.nombre}</div>
                      <div className="doc-detail-meta">
                        {selectedMedico?.matricula && (
                          <span>Matrícula: {selectedMedico.matricula}</span>
                        )}
                        {selectedMedico?.sedes?.[0]?.nombre && (
                          <span>Sede: {selectedMedico.sedes[0].nombre}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <PreselSidebar onConfirm={() => setStep(5)} />
              </div>
            </div>
          )}

          {/* ══ PASO 5: Confirmar ══ */}
          {step === 5 && (
            <div className="confirm-layout-centered">
              <div className="card">
                <div className="card-header">
                  <div className="card-header-icon"><FaCheckCircle /></div>
                  <div>
                    <h2>Confirmar Reserva de Cita</h2>
                    <p className="wizard-subtitle">Revisá los detalles de tus turnos preseleccionados antes de guardarlos</p>
                  </div>
                </div>
                <div className="card-body">
                  {cartItems.map((item, index) => (
                    <div
                      className="confirm-box"
                      key={item.id || index}
                      style={{ marginBottom: '1.5rem' }}
                    >
                      <div className="confirm-header-inside" style={{ fontWeight: 'bold', paddingBottom: '0.5rem' }}>
                        Turno #{index + 1}
                      </div>

                      <div className="confirm-row">
                        <div>
                          <div className="confirm-label">Paciente de Reserva</div>
                          <div className="confirm-value">{selectedPaciente?.nombre}</div>
                          <div className="confirm-sub">
                            DNI: {selectedPaciente?.dni} · Obra Social:{' '}
                            {selectedPaciente?.obraSocial} ({selectedPaciente?.plan})
                          </div>
                        </div>
                      </div>

                      <div className="confirm-row">
                        <div>
                          <div className="confirm-label">Servicio Solicitado</div>
                          <div className="confirm-value">
                            {item.especialidad || item.practica || selectedService?.nombre}
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditarTurno(item, 1)}>
                          ✎ Cambiar
                        </button>
                      </div>

                      <div className="confirm-row">
                        <div>
                          <div className="confirm-label">Profesional Asignado</div>
                          <div className="confirm-value">
                            {item.medico?.nombre || selectedMedico?.nombre || 'Cualquier Profesional disponible'}
                          </div>
                          <div className="confirm-sub">
                            Sede: {item.sede?.nombre || 'No asignada'}
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditarTurno(item, 2)}>
                          ✎ Cambiar
                        </button>
                      </div>

                      <div className="confirm-row">
                        <div>
                          <div className="confirm-label">Fecha y Hora</div>
                          <div className="confirm-value highlight-value">
                            {item.fecha || selectedDate} a las {item.hora} hs
                          </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditarTurno(item, 4)}>
                          ✎ Cambiar
                        </button>
                      </div>

                      <div className="confirm-row">
                        <div>
                          <div className="confirm-label">Cobertura y Costo</div>
                          <div className="confirm-value highlight-cost-value">
                            {item.costoEstimado === 0
                              ? `100% Cubierto por ${selectedPaciente?.obraSocial}`
                              : `Paga Particular: $${item.costoEstimado}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="btn-row">
                    <button className="btn btn-ghost" onClick={() => setStep(4)}>← Volver</button>
                    <button
                      className="btn btn-success"
                      onClick={handleConfirmReservation}
                      disabled={cartItems.length === 0}
                    >
                      🎉 Confirmar Reserva de ({cartItems.length}) Turno(s)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {selectedPaciente && (
        <HistorialSection historial={historialCitas} loadingHistorial={loadingHistorial} paciente={selectedPaciente} />
      )}
    </div>
  );
}

// --- Componente de Historial ---
function HistorialSection({ historial, loadingHistorial, paciente }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('fecha');
  const [sortOrder, setSortOrder] = useState('DESC');
  const limit = 5;

  const safeHistorial = Array.isArray(historial) ? historial : [];

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const sortedHistorial = [...safeHistorial].sort((a, b) => {
    if (!a || !b) return 0;
    if (sortBy === 'fecha') {
      const dateA = new Date(a.fechaHora || 0).getTime();
      const dateB = new Date(b.fechaHora || 0).getTime();
      const valA = isNaN(dateA) ? 0 : dateA;
      const valB = isNaN(dateB) ? 0 : dateB;
      return sortOrder === 'ASC' ? valA - valB : valB - valA;
    } else if (sortBy === 'costo') {
      const getCost = (t) => t.costoEstimado === 0 ? 0 : (t.costoEstimado ?? t.costo ?? 0);
      const costoA = getCost(a);
      const costoB = getCost(b);
      return sortOrder === 'ASC' ? costoA - costoB : costoB - costoA;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedHistorial.length / limit) || 1;
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const currentData = sortedHistorial.slice((validPage - 1) * limit, validPage * limit);

  return (
    <div className="historial-paciente-seccion">
      <div className="historial-header-container">
        <div className="historial-header-title">
          <FaCalendarAlt style={{color: 'var(--brand)'}}/> Sus turnos registrados
        </div>
        {!loadingHistorial && safeHistorial.length > 0 && (
          <div className="historial-sort-controls">
            <label htmlFor="sort-historial">Ordenar por:</label>
            <select id="sort-historial" className="historial-select" value={`${sortBy}-${sortOrder}`} onChange={handleSortChange}>
              <option value="fecha-DESC">Fecha (Más recientes primero)</option>
              <option value="fecha-ASC">Fecha (Más antiguos primero)</option>
              <option value="costo-ASC">Costo (Menor a mayor)</option>
              <option value="costo-DESC">Costo (Mayor a menor)</option>
            </select>
          </div>
        )}
      </div>

      {loadingHistorial ? (
        <div className="historial-cargando">Cargando sus turnos reservados...</div>
      ) : safeHistorial.length === 0 ? (
        <div className="historial-vacio">
          Usted no posee citas registradas o reservadas en el sistema.
        </div>
      ) : (
        <>
          <div className="historial-tabla-wrapper">
            <table className="historial-tabla">
              <thead>
                <tr>
                  <th>Profesional</th>
                  <th>Servicio / Especialidad</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Sede</th>
                  <th>Estado</th>
                  <th>Cobertura</th>
                  <th>Costo Estimado</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((turno) => {
                  const isRealizado = turno.estado === 'REALIZADO' || turno.estado?.getEstadoNombre?.() === 'REALIZADO';
                  const isReservado = turno.estado === 'RESERVADO' || turno.estado?.getEstadoNombre?.() === 'RESERVADO';
                  const isCancelado = turno.estado === 'CANCELADO' || turno.estado?.getEstadoNombre?.() === 'CANCELADO';
                  const isDisponible = turno.estado === 'DISPONIBLE' || turno.estado?.getEstadoNombre?.() === 'DISPONIBLE';
                  let estadoLabel = turno.estado || 'RESERVADO';
                  if (typeof turno.estado?.getEstadoNombre === 'function') {
                    estadoLabel = turno.estado.getEstadoNombre();
                  }

                  const fechaFormatted = turno.fechaHora
                    ? turno.fechaHora.includes('T') ? turno.fechaHora.split('T')[0] : turno.fechaHora
                    : 'Sin fecha';

                  return (
                    <tr key={turno.id || turno._id || turno.id_turno}>
                      <td><strong>{turno.medico || 'No especificado'}</strong></td>
                      <td>{turno.servicio || 'General'}</td>
                      <td>{fechaFormatted}</td>
                      <td>{turno.hora ? `${turno.hora} hs` : 'Sin definir'}</td>
                      <td>{turno.sede || 'No especificada'}</td>
                      <td>
                        <span className={`estado-badge ${isRealizado ? 'realizado' : ''} ${isReservado ? 'reservado' : ''} ${isCancelado ? 'cancelado' : ''} ${isDisponible ? 'disponible' : ''}`}>
                          {estadoLabel}
                        </span>
                      </td>
                      <td>{turno.cobertura || 'No cubierta'}</td>
                      <td>
                        <span className="costo-texto">
                          {turno.costoEstimado === 0 ? 'Cubierto 100% ($0)' : `$${turno.costoEstimado ?? turno.costo ?? 0}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="historial-pagination">
            <span className="pagination-info">Mostrando página <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
            <div className="pagination-buttons">
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Anterior</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
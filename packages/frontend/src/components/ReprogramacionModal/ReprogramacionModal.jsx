import { useState, useEffect } from 'react';
import './ReprogramacionModal.css';
import { useAuth } from '../AuthProvider.jsx';
import { getFechasDisponibles, getHorariosDisponibles } from '../../services/turnoService.js';

/**
 * Modal único de "Proponer reprogramación", compartido entre la pantalla del
 * médico (DetalleTurnoMedico) y la del paciente (DetalleTurno).
 *
 * Antes cada rol tenía su propia implementación: el médico usaba este mismo
 * modal (definido dentro de DetalleTurnoMedico.jsx) mientras que el paciente
 * navegaba a una pantalla completa aparte (ReprogramarTurno.jsx) con un wizard
 * de 3 pasos. Se unifican en este componente para que ambos vean exactamente
 * el mismo diseño (y para no mantener dos veces la misma lógica de consulta
 * de disponibilidad real).
 *
 * Requiere que `turno` tenga `servicio_id`, `servicio_tipo` y `medico_id`
 * (ambos DTOs — el de médico y el de paciente — ya incluyen estos campos).
 */
export default function ReprogramacionModal({ turno, onConfirmar, onCerrar }) {
  const { email, password } = useAuth();

  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');

  // Se consulta la disponibilidad real del médico para el mismo servicio del
  // turno (igual para médico y paciente): así no se puede proponer un
  // horario que después el backend vaya a rechazar.
  const tipoEsPractica = turno.servicio_tipo === 'PRACTICA';
  const tieneDatosParaBuscar = !!turno.servicio_id && !!turno.medico_id;

  const armarParamsBase = () => {
    const params = { profesionalId: turno.medico_id };
    if (tipoEsPractica) params.practica = turno.servicio_id;
    else params.especialidad = turno.servicio_id;
    return params;
  };

  useEffect(() => {
    if (!tieneDatosParaBuscar || !email || !password) {
      setCargandoFechas(false);
      setErrorCarga(
        !tieneDatosParaBuscar
          ? 'No se pudo determinar el servicio/médico de este turno para buscar disponibilidad.'
          : '',
      );
      return;
    }

    const cargarFechas = async () => {
      setCargandoFechas(true);
      setErrorCarga('');
      try {
        const res = await getFechasDisponibles(armarParamsBase(), email, password);
        const fechas = Array.isArray(res?.data) ? res.data : [];
        setFechasDisponibles([...fechas].sort());
      } catch (err) {
        console.error('Error al obtener fechas disponibles:', err);
        setErrorCarga('No se pudieron obtener las fechas disponibles.');
        setFechasDisponibles([]);
      } finally {
        setCargandoFechas(false);
      }
    };

    cargarFechas();
  }, [email, password]);

  const handleSeleccionarFecha = async (fechaISO) => {
    // fechaISO viene 'YYYY-MM-DD'; el input de fecha final se muestra como DD/MM/YYYY
    const [anio, mes, dia] = fechaISO.split('-');
    setFecha(`${dia}/${mes}/${anio}`);
    setHora('');
    setHorariosDisponibles([]);
    setErrores((p) => ({ ...p, fecha: false }));
    setCargandoHorarios(true);
    setErrorCarga('');
    try {
      const res = await getHorariosDisponibles(
        { ...armarParamsBase(), fecha: fechaISO },
        email,
        password,
      );
      const horarios = Array.isArray(res?.data) ? res.data : [];
      setHorariosDisponibles(horarios);
    } catch (err) {
      console.error('Error al obtener horarios disponibles:', err);
      setErrorCarga('No se pudieron obtener los horarios disponibles para esa fecha.');
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  const formatFechaChip = (fechaISO) => {
    const [, mes, dia] = fechaISO.split('-');
    return `${dia}/${mes}`;
  };

  const handleSubmit = async () => {
    const e = {};
    if (!fecha || !/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) e.fecha = true;
    if (!hora) e.hora = true;
    if (!motivo.trim()) e.motivo = true;
    setErrores(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    setErrorEnvio('');
    try {
      await onConfirmar({ fecha, hora, motivo: motivo.trim() });
    } catch (err) {
      setErrorEnvio(
        err.response?.data?.message ?? 'Error al enviar la propuesta de reprogramación',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="reprogramacion-modal-box" onClick={(ev) => ev.stopPropagation()}>
        <div className="reprogramacion-modal-header">
          <h3 className="modal-titulo">Proponer reprogramación</h3>
          <p className="modal-subtitulo">Proponé una nueva fecha y hora para el turno.</p>
        </div>

        <div className="reprogramacion-modal-body">
          {errorCarga && <span className="modal-error">⚠ {errorCarga}</span>}

          <label className="modal-label">1. Nueva fecha *</label>
          {cargandoFechas ? (
            <p className="reprogramacion-modal-info">Buscando fechas disponibles...</p>
          ) : fechasDisponibles.length === 0 ? (
            <p className="reprogramacion-modal-info">No hay fechas disponibles por ahora.</p>
          ) : (
            <div className="grid-horarios">
              {fechasDisponibles.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`fecha-slot-btn ${fecha === `${f.split('-')[2]}/${f.split('-')[1]}/${f.split('-')[0]}` ? 'seleccionado' : ''}`}
                  onClick={() => handleSeleccionarFecha(f)}
                >
                  {formatFechaChip(f)}
                </button>
              ))}
            </div>
          )}
          {errores.fecha && <span className="modal-error">⚠ Elegí una fecha disponible</span>}

          {fecha && (
            <>
              <label className="modal-label">2. Nuevo horario *</label>
              {cargandoHorarios ? (
                <p className="reprogramacion-modal-info">Buscando horarios disponibles...</p>
              ) : horariosDisponibles.length === 0 ? (
                <p className="reprogramacion-modal-info">
                  No hay horarios disponibles para esa fecha.
                </p>
              ) : (
                // Sólo esta grilla scrollea (con scrollbar propio y angosto)
                // cuando hay muchos horarios; antes se scrolleaba el modal
                // COMPLETO, lo que dejaba el scrollbar nativo del sistema
                // "cortando" el borde redondeado y empujaba los botones de
                // Cancelar/Proponer fuera de la vista.
                <div className="grid-horarios grid-horarios-scroll">
                  {horariosDisponibles.map((h) => (
                    <button
                      key={h.hora}
                      type="button"
                      className={`hora-slot-btn ${hora === h.hora ? 'seleccionado' : ''}`}
                      onClick={() => {
                        setHora(h.hora);
                        setErrores((p) => ({ ...p, hora: false }));
                      }}
                    >
                      {h.hora} hs
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {errores.hora && <span className="modal-error">⚠ El horario es obligatorio</span>}

          <label className="modal-label">3. Motivo *</label>
          <textarea
            className={`modal-input${errores.motivo ? ' input-error' : ''}`}
            placeholder="Motivo de la reprogramación"
            rows={3}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              setErrores((p) => ({ ...p, motivo: false }));
            }}
            style={{ resize: 'none', fontFamily: 'inherit' }}
          />
          {errores.motivo && <span className="modal-error">⚠ El motivo es obligatorio</span>}
          {errorEnvio && <span className="modal-error">⚠ {errorEnvio}</span>}
        </div>

        <div className="modal-acciones reprogramacion-modal-footer">
          <button className="btn-cancelar-accion" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="btn-confirmar-accion"
            onClick={handleSubmit}
            disabled={submitting || !fecha || !hora}
          >
            {submitting ? 'Enviando...' : '→ Proponer'}
          </button>
        </div>
      </div>
    </div>
  );
}

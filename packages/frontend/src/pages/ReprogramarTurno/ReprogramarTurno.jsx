import React, { useState, useEffect } from 'react';
import './ReprogramarTurno.css';
import { useAuth } from '../../components/AuthProvider.jsx';
import { getFechasDisponibles, getHorariosDisponibles } from '../../services/turnoService.js';

export default function ReprogramarTurno({ turno, onVolver, onFinalizar, onEnviarSolicitud }) {
  const { email, password } = useAuth();

  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errorMotivo, setErrorMotivo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');

  // Antes esta pantalla mostraba horarios inventados (slotsSimulados), sin
  // relación con la disponibilidad real del médico — casi cualquier elección
  // fallaba al enviarla al backend. Ahora se consulta la disponibilidad real,
  // igual que en el buscador de turnos (AgendarTurno), usando el mismo
  // servicio y médico del turno original.
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
        setErrorCarga('No se pudieron obtener las fechas disponibles del profesional.');
        setFechasDisponibles([]);
      } finally {
        setCargandoFechas(false);
      }
    };

    cargarFechas();
  }, [email, password]);

  const handleSeleccionarFecha = async (fechaStr) => {
    setFecha(fechaStr);
    setHora('');
    setHorariosDisponibles([]);
    setCargandoHorarios(true);
    setErrorCarga('');
    try {
      const res = await getHorariosDisponibles(
        { ...armarParamsBase(), fecha: fechaStr },
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

  const formatFechaChip = (fechaStr) => {
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}/${mes}`;
  };

  const handleConfirmarSolicitud = async () => {
    if (!fecha || !hora) return;
    if (!motivo.trim()) {
      setErrorMotivo(true);
      return;
    }

    // Formato DD/MM/AAAA requerido por el backend (fecha llega como AAAA-MM-DD)
    const fechaFormateada = fecha.split('-').reverse().join('/');

    if (onEnviarSolicitud) {
      setEnviando(true);
      setErrorEnvio('');
      try {
        await onEnviarSolicitud(fechaFormateada, hora, motivo.trim());
        setEnviando(false);
        onFinalizar();
      } catch (err) {
        setErrorEnvio(
          err.response?.data?.message ?? 'Error al enviar la propuesta de reprogramación',
        );
        setEnviando(false);
        return;
      }
    } else {
      // Fallback local (sin integración con backend)
      turno.fechaHora = `${fecha}T00:00:00`;
      turno.hora = hora;
      turno.estado = 'PENDIENTE_REPROGRAMACION';
      onFinalizar();
    }
  };

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn text-ellipsis" onClick={onVolver}>
          ← Volver al Detalle
        </button>
        <h1 className="historial-title text-ellipsis" style={{ marginTop: '15px' }}>
          Solicitar Reprogramación
        </h1>
        <p className="historial-subtitle text-ellipsis">
          Enviá una propuesta de cambio para tu cita con el {turno.medico?.nombre ?? turno.medico}
        </p>
      </div>

      <div className="reprogramar-card">
        {errorCarga && (
          <p style={{ color: '#b91c1c', fontSize: 13, marginBottom: 12 }}>⚠ {errorCarga}</p>
        )}

        {/* Paso 1: Selección de Fecha (real, consultada al backend) */}
        <div className="reprogramar-paso-section">
          <label className="reprogramar-paso-title text-ellipsis">
            1. Seleccioná el nuevo día propuesto:
          </label>
          {cargandoFechas ? (
            <p className="reprogramar-vacio">Buscando fechas disponibles...</p>
          ) : fechasDisponibles.length === 0 ? (
            <p className="reprogramar-vacio">
              No hay fechas disponibles para este profesional en este momento.
            </p>
          ) : (
            <div className="grid-horarios">
              {fechasDisponibles.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`fecha-slot-btn ${fecha === f ? 'seleccionado' : ''} text-ellipsis`}
                  onClick={() => handleSeleccionarFecha(f)}
                >
                  {formatFechaChip(f)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Paso 2: Selección de Horario (real, consultado al backend para esa fecha) */}
        {fecha && (
          <div className="reprogramar-paso-section">
            <label className="reprogramar-paso-title text-ellipsis">
              2. Seleccioná un horario disponible:
            </label>
            {cargandoHorarios ? (
              <p className="reprogramar-vacio">Buscando horarios disponibles...</p>
            ) : horariosDisponibles.length === 0 ? (
              <p className="reprogramar-vacio">No hay horarios disponibles para esta fecha.</p>
            ) : (
              <div className="grid-horarios">
                {horariosDisponibles.map((h) => (
                  <button
                    key={h.hora}
                    type="button"
                    className={`hora-slot-btn ${hora === h.hora ? 'seleccionado' : ''} text-ellipsis`}
                    onClick={() => setHora(h.hora)}
                  >
                    {h.hora} hs
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 3: Motivo */}
        {fecha && hora && (
          <div className="reprogramar-paso-section">
            <label className="reprogramar-paso-title text-ellipsis">3. Contanos el motivo:</label>
            <textarea
              className="reprogramar-input-fecha"
              rows={3}
              placeholder="Ej: Conflicto de horario laboral..."
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErrorMotivo(false);
              }}
              style={{ resize: 'none', fontFamily: 'inherit', width: '100%' }}
            />
            {errorMotivo && (
              <span style={{ color: '#b91c1c', fontSize: 12 }}>⚠ El motivo es obligatorio</span>
            )}
          </div>
        )}

        {errorEnvio && <p style={{ color: '#b91c1c', fontSize: 13 }}>⚠ {errorEnvio}</p>}

        {/* Botón finalizador de flujo transformado a Solicitud */}
        <button
          className="btn-confirmar-cambio text-ellipsis"
          disabled={!fecha || !hora || enviando}
          onClick={handleConfirmarSolicitud}
        >
          {enviando ? 'Enviando...' : 'Enviar Solicitud de Cambio ✓'}
        </button>
      </div>
    </div>
  );
}

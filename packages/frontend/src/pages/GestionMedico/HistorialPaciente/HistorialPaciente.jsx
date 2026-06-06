import { useState } from 'react';
import { PACIENTES_MOCK, HISTORIAL_POR_PACIENTE } from '../../../mockdata/pacientes.js';
import { ESTADO_CONFIG } from '../../../mockdata/turnos.js';
import './HistorialPaciente.css';

function formatFecha(fechaHora) {
  const d = new Date(fechaHora);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Vista: Listado de turnos del paciente encontrado ─────────────────────
function HistorialPacienteListado({ paciente, turnos, onVolver }) {
  const [filtro, setFiltro] = useState('TODOS');
  const [turnoExpandido, setTurnoExpandido] = useState(null);

  const estados = ['TODOS', ...Object.keys(ESTADO_CONFIG)];
  const turnosFiltrados = filtro === 'TODOS'
    ? turnos
    : turnos.filter((t) => t.estado === filtro);

  return (
    <div className="historial-container">
      <div className="historial-header">
        <button className="filtro-btn" onClick={onVolver}>← Nueva búsqueda</button>
        <h1 className="historial-title" style={{ marginTop: '15px' }}>
          Historial de {paciente.nombre}
        </h1>
        <p className="historial-subtitle">
          DNI {paciente.dni} · {paciente.obraSocial} · {paciente.plan}
        </p>
      </div>

      <div className="filtros">
        {estados.map((e) => (
          <button
            key={e}
            className={`filtro-btn ${filtro === e ? 'activo' : ''}`}
            onClick={() => setFiltro(e)}
          >
            {e === 'TODOS' ? 'Todos' : ESTADO_CONFIG[e].label}
          </button>
        ))}
      </div>

      {turnosFiltrados.length === 0 ? (
        <p className="historial-vacio">
          {turnos.length === 0
            ? 'Este paciente no tiene turnos registrados.'
            : 'No hay turnos con ese estado.'}
        </p>
      ) : (
        <ul className="turnos-lista">
          {turnosFiltrados.map((turno) => {
            const cfg = ESTADO_CONFIG[turno.estado] ?? { label: turno.estado, color: '' };
            const expandido = turnoExpandido === turno.id_turno;
            return (
              <li key={turno.id_turno} className="turno-card turno-card--clickable"
                onClick={() => setTurnoExpandido(expandido ? null : turno.id_turno)}
              >
                {/* Fila principal */}
                <div className="turno-card-left">
                  <span className="turno-fecha">{formatFecha(turno.fechaHora)}</span>
                  <span className="turno-hora">{turno.hora}</span>
                </div>
                <div className="turno-card-center">
                  <span className="turno-servicio">{turno.servicio_nombre}</span>
                  <span className="turno-medico">{turno.nombreMedico}</span>
                  {turno.sede && <span className="turno-sede">{turno.sede.nombre}</span>}
                </div>
                <div className="turno-card-right">
                  <span className={`turno-estado ${cfg.color}`}>{cfg.label}</span>
                  <span className="turno-costo">${turno.costo?.toLocaleString('es-AR')}</span>
                </div>
                <span className="turno-chevron">{expandido ? '▲' : '▼'}</span>

                {/* Historial de estados expandible */}
                {expandido && (
                  <div className="turno-historial" onClick={(e) => e.stopPropagation()}>
                    <p className="turno-historial-titulo">Historial de estados</p>
                    <ul className="turno-historial-lista">
                      {turno.historialEstados.map((h, i) => {
                        const hCfg = ESTADO_CONFIG[h.estado] ?? { label: h.estado, color: '' };
                        return (
                          <li key={i} className="turno-historial-item">
                            <span className={`turno-estado ${hCfg.color}`}>{hCfg.label}</span>
                            <span className="turno-historial-fecha">{formatFecha(h.fechaHoraCambio)}</span>
                            <span className="turno-historial-motivo">{h.motivo}</span>
                            <span className="turno-historial-actor">@{h.actor}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Vista principal: búsqueda por DNI ────────────────────────────────────
export default function HistorialPaciente() {
  const [dni, setDni] = useState('');
  const [estado, setEstado] = useState('idle'); // 'idle' | 'not_found' | 'found'
  const [pacienteEncontrado, setPacienteEncontrado] = useState(null);
  const [historial, setHistorial] = useState([]);

  const handleBuscar = () => {
    const trimmed = dni.trim();
    if (!trimmed) return;

    const paciente = PACIENTES_MOCK.find((p) => p.dni === trimmed);
    if (!paciente) {
      setEstado('not_found');
      setPacienteEncontrado(null);
      setHistorial([]);
      return;
    }

    const turnos = HISTORIAL_POR_PACIENTE[paciente.id_paciente] ?? [];
    setPacienteEncontrado(paciente);
    setHistorial(turnos);
    setEstado('found');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleVolver = () => {
    setEstado('idle');
    setDni('');
    setPacienteEncontrado(null);
    setHistorial([]);
  };

  // Si encontramos al paciente, mostramos su historial
  if (estado === 'found') {
    return (
      <HistorialPacienteListado
        paciente={pacienteEncontrado}
        turnos={historial}
        onVolver={handleVolver}
      />
    );
  }

  // Vista de búsqueda
  return (
    <div className="historial-container">
      <div className="historial-header">
        <h1 className="historial-title">Historial de Paciente</h1>
        <p className="historial-subtitle">Ingresá el DNI del paciente para ver su historial de turnos</p>
      </div>

      <div className="hp-search-box">
        <div className="hp-search-row">
          <input
            className="hp-input"
            type="text"
            placeholder="Ej: 30123456"
            value={dni}
            onChange={(e) => {
              setDni(e.target.value);
              if (estado === 'not_found') setEstado('idle');
            }}
            onKeyDown={handleKeyDown}
            maxLength={8}
          />
          <button className="hp-btn-buscar" onClick={handleBuscar} disabled={!dni.trim()}>
            Buscar
          </button>
        </div>

        {estado === 'not_found' && (
          <p className="hp-error">No se encontró ningún paciente con el DNI <strong>{dni}</strong>.</p>
        )}
      </div>

      {/* Ayuda visual */}
      <div className="hp-hint">
        <p className="hp-hint-titulo">DNIs de prueba disponibles:</p>
        <ul className="hp-hint-lista">
          {PACIENTES_MOCK.map((p) => (
            <li key={p.dni} className="hp-hint-item" onClick={() => setDni(p.dni)}>
              <span className="hp-hint-dni">{p.dni}</span>
              <span className="hp-hint-nombre">{p.nombre}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

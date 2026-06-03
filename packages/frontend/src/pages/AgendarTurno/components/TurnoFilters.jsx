import './TurnoFilters.css';

export default function TurnoFilters({
  especialidades,
  practicas,
  medicos,
  sedes,
  pacientes,
  searchMode,
  setSearchMode,
  selectedEspecialidad,
  setSelectedEspecialidad,
  selectedPractica,
  setSelectedPractica,
  selectedMedico,
  setSelectedMedico,
  selectedSede,
  setSelectedSede,
  selectedPaciente,
  setSelectedPaciente,
  fechaDesde,
  setFechaDesde,
  fechaHasta,
  setFechaHasta,
  onSubmit,
  loading,
}) {
  return (
    <form className="filtros-tarjeta" onSubmit={onSubmit}>
      <div className="filtros-grilla">
        {/* Selector de Modo */}
        <div className="filtro-grupo ancho-completo-sm">
          <label className="filtro-etiqueta">Tipo de Prestación</label>
          <div className="modo-conmutador">
            <button
              type="button"
              className={`boton-conmutador ${searchMode === 'ESPECIALIDAD' ? 'active' : ''}`}
              onClick={() => {
                setSearchMode('ESPECIALIDAD');
                setSelectedPractica('');
              }}
            >
              Especialidad
            </button>
            <button
              type="button"
              className={`boton-conmutador ${searchMode === 'PRACTICA' ? 'active' : ''}`}
              onClick={() => {
                setSearchMode('PRACTICA');
                setSelectedEspecialidad('');
              }}
            >
              Práctica
            </button>
          </div>
        </div>

        {/* Select de Especialidad */}
        {searchMode === 'ESPECIALIDAD' ? (
          <div className="filtro-grupo">
            <label className="filtro-etiqueta" htmlFor="especialidad">Especialidad *</label>
            <select
              id="especialidad"
              value={selectedEspecialidad}
              onChange={(e) => setSelectedEspecialidad(e.target.value)}
              required
            >
              <option value="">Seleccione Especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp._id} value={esp._id}>{esp.nombre}</option>
              ))}
            </select>
          </div>
        ) : (
          /* Select de Práctica */
          <div className="filtro-grupo">
            <label className="filtro-etiqueta" htmlFor="practica">Práctica *</label>
            <select
              id="practica"
              value={selectedPractica}
              onChange={(e) => setSelectedPractica(e.target.value)}
              required
            >
              <option value="">Seleccione Práctica</option>
              {practicas.map((prac) => (
                <option key={prac._id} value={prac._id}>{prac.nombre} ({prac.codigo})</option>
              ))}
            </select>
          </div>
        )}

        {/* Selector de Médico */}
        <div className="filtro-grupo">
          <label className="filtro-etiqueta" htmlFor="medico">Médico (Opcional)</label>
          <select
            id="medico"
            value={selectedMedico}
            onChange={(e) => setSelectedMedico(e.target.value)}
          >
            <option value="">Todos los médicos</option>
            {medicos.map((med) => (
              <option key={med.id_medico} value={med.id_medico}>{med.nombre}</option>
            ))}
          </select>
        </div>

        {/* Selector de Sede */}
        <div className="filtro-grupo">
          <label className="filtro-etiqueta" htmlFor="sede">Sede (Opcional)</label>
          <select
            id="sede"
            value={selectedSede}
            onChange={(e) => setSelectedSede(e.target.value)}
          >
            <option value="">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s._id} value={s._id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Selector de Paciente de Prueba */}
        <div className="filtro-grupo">
          <label className="filtro-etiqueta" htmlFor="paciente">Paciente de Prueba (Opcional)</label>
          <select
            id="paciente"
            value={selectedPaciente}
            onChange={(e) => setSelectedPaciente(e.target.value)}
          >
            <option value="">Costo Particular (Sin Cobertura)</option>
            {pacientes.map((pac) => (
              <option key={pac.id_paciente} value={pac.id_paciente}>{pac.nombre} (DNI: {pac.dni})</option>
            ))}
          </select>
        </div>

        {/* Fecha Desde */}
        <div className="filtro-grupo">
          <label className="filtro-etiqueta" htmlFor="fechaDesde">Fecha Desde</label>
          <input
            id="fechaDesde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            required
          />
        </div>

        {/* Fecha Hasta */}
        <div className="filtro-grupo">
          <label className="filtro-etiqueta" htmlFor="fechaHasta">Fecha Hasta (Opcional)</label>
          <input
            id="fechaHasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>

      <div className="busqueda-acciones">
        <button type="submit" className="boton-buscar" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar Turnos'}
        </button>
      </div>
    </form>
  );
}

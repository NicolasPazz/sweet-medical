import { useState, useEffect } from 'react';
import {
  getMedicos,
  getEspecialidades,
  getPracticas,
  getSedes,
  getPacientes,
  buscarTurnosDisponibles,
} from '../../services/turnoService';
import TurnoFilters from './components/TurnoFilters';
import TurnosToolbar from './components/TurnosToolbar';
import TurnosTable from './components/TurnosTable';
import TurnosPagination from './components/TurnosPagination';
import './AgendarTurno.css';

export default function AgendarTurno() {
  // Option lists from backend
  const [medicos, setMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [pacientes, setPacientes] = useState([]);

  // Search Filter State
  const [searchMode, setSearchMode] = useState('ESPECIALIDAD'); // 'ESPECIALIDAD' or 'PRACTICA'
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [selectedPractica, setSelectedPractica] = useState('');
  const [selectedMedico, setSelectedMedico] = useState('');
  const [selectedSede, setSelectedSede] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState(''); // patientIdTest
  const [fechaDesde, setFechaDesde] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [fechaHasta, setFechaHasta] = useState('');

  // Results & Table States
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Sorting State
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('costo'); // 'fecha' or 'costo'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Fetch filter options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resMedicos, resEsp, resPrac, resSedes, resPacientes] = await Promise.all([
          getMedicos(),
          getEspecialidades(),
          getPracticas(),
          getSedes(),
          getPacientes()
        ]);

        if (resMedicos?.status === 'success') setMedicos(resMedicos.data);
        if (resEsp?.status === 'success') setEspecialidades(resEsp.data);
        if (resPrac?.status === 'success') setPracticas(resPrac.data);
        if (resSedes?.status === 'success') setSedes(resSedes.data);
        if (resPacientes?.status === 'success') setPacientes(resPacientes.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };

    fetchOptions();
  }, []);

  // Fetch results when search parameters, page, limit, sortBy or sortOrder changes
  const executeSearch = async (targetPage = 1) => {
    const selectedService = searchMode === 'ESPECIALIDAD' ? selectedEspecialidad : selectedPractica;
    if (!selectedService) {
      setError(`Debe seleccionar una ${searchMode === 'ESPECIALIDAD' ? 'especialidad' : 'práctica'} para realizar la búsqueda.`);
      setTurnos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: targetPage,
        limit,
        sortBy,
        sortOrder,
        fechaDesde
      };

      if (searchMode === 'ESPECIALIDAD') {
        params.especialidad = selectedEspecialidad;
      } else {
        params.practica = selectedPractica;
      }

      if (selectedMedico) params.profesionalId = selectedMedico;
      if (selectedSede) params.sede = selectedSede;
      if (selectedPaciente) params.pacienteId = selectedPaciente;
      if (fechaHasta) params.fechaHasta = fechaHasta;

      const res = await buscarTurnosDisponibles(params);

      if (res?.status === 'success') {
        setTurnos(res.data || []);
        setTotalResults(res.total || 0);
        setPage(res.page || 1);
        setTotalPages(res.totalPages || 1);
      } else {
        throw new Error('Formato de respuesta incorrecto');
      }
    } catch (err) {
      console.error('Error fetching available turns:', err);
      setError(err.response?.data?.message || 'Error al obtener la disponibilidad de turnos. Verifique los parámetros.');
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (e) => {
    e.preventDefault();
    executeSearch(1);
  };

  useEffect(() => {
    const selectedService = searchMode === 'ESPECIALIDAD' ? selectedEspecialidad : selectedPractica;
    if (selectedService) {
      executeSearch(page);
    }
  }, [sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      executeSearch(newPage);
    }
  };

  return (
    <div className="agendar-container agendar-busqueda-contenedor">
      <header className="agendar-header">
        <h1 className="agendar-title">Búsqueda de Turnos Disponibles</h1>
        <p className="agendar-subtitle">Consulte y ordene turnos en tiempo real con coberturas de pacientes.</p>
      </header>

      {/* Formulario de Filtros */}
      <TurnoFilters
        especialidades={especialidades}
        practicas={practicas}
        medicos={medicos}
        sedes={sedes}
        pacientes={pacientes}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        selectedEspecialidad={selectedEspecialidad}
        setSelectedEspecialidad={setSelectedEspecialidad}
        selectedPractica={selectedPractica}
        setSelectedPractica={setSelectedPractica}
        selectedMedico={selectedMedico}
        setSelectedMedico={setSelectedMedico}
        selectedSede={selectedSede}
        setSelectedSede={setSelectedSede}
        selectedPaciente={selectedPaciente}
        setSelectedPaciente={setSelectedPaciente}
        fechaDesde={fechaDesde}
        setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta}
        setFechaHasta={setFechaHasta}
        onSubmit={handleSearchClick}
        loading={loading}
      />

      {/* Controles de Ordenamiento */}
      <TurnosToolbar
        totalResults={totalResults}
        loading={loading}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {/* Área Principal de Contenidos */}
      {loading && (
        <div className="cargando-contenedor">
          <div className="cargador"></div>
          <p>Buscando turnos disponibles en tiempo real...</p>
        </div>
      )}

      {error && (
        <div className="error-contenedor">
          <div className="agendar-estado error">⚠ {error}</div>
        </div>
      )}

      {!loading && !error && turnos.length > 0 && (
        <>
          {/* Tabla de Resultados */}
          <TurnosTable turnos={turnos} />

          {/* Controles de Paginación */}
          <TurnosPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && !error && turnos.length === 0 && (
        <div className="vacio-contenedor">
          <p className="agendar-estado">Seleccione los filtros requeridos y presione "Buscar Turnos" para visualizar la disponibilidad real del backend.</p>
        </div>
      )}
    </div>
  );
}

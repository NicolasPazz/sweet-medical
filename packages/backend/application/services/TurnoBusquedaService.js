import { MotorCostos } from '../../domain/cobertura/MotorCostos.js';
import { TurnoMapper } from '../../domain/turno/dtos/TurnoMapper.js';
import { FiltroBusquedaSpecification } from '../../domain/busqueda/FiltroBusquedaSpecification.js';
import { logger } from '../../domain/utils/logger.js';

const MAX_RESULTADOS_COSTO = 500;

export class TurnoBusquedaService {
  constructor(busquedaTurnosRepository, motorCostos) {
    this.repository = busquedaTurnosRepository;
    this.motorCostos = motorCostos;
  }

  /**
   * @param {Object} filtros - obj con profesionalId, especialidadId, practicaId, sedeId, fechaDesde, fechaHasta, etc.
   * @param {Paciente} paciente - Paciente realizando la búsqueda
   * @param {Object} paginacion - { page, limit, sortBy, sortOrder }
   */

  async buscarTurnos(filtros, paciente, paginacion) {
    const spec = new FiltroBusquedaSpecification(filtros);
    const { page, limit, sortBy, sortOrder } = paginacion;
    
    let resultadosDomain = [];
    let totalItems = 0;

    // ESTRATEGIA HÍBRIDA
    if (sortBy !== 'costo') {
      // CASO A: Orden normal (fecha, médico). 
      // Delegamos a la DB (Repository) porque es mucho más rápido y eficiente.
      const queryResult = await this.repository.buscar(spec, { sortBy, sortOrder }, { page, limit });
      resultadosDomain = queryResult.data;
      totalItems = queryResult.total;
    } else {
      // CASO B: Orden por COSTO.
      // ¡Problema! MongoDB no sabe cuánto le sale el turno a "Juan" vs "Pedro" (depende de su obra social).
      // El costo se calcula por código, no está en la tabla.
      
      // Traemos todos los turnos disponibles (hasta un tope de 500 para no saturar la memoria).
      const allMatches = await this.repository.buscar(spec, null, null); 
      
      if (allMatches.total > MAX_RESULTADOS_COSTO) {
        throw new Error('Demasiados resultados para ordenar por costo. Aplicá más filtros.');
      }
      
      resultadosDomain = allMatches.data;
      totalItems = allMatches.total;
    }

    // MAPEO Y CÁLCULO DE COSTOS
    // Convertimos los modelos de DB a DTOs usando el Mapper.
    const dtosMapeados = resultadosDomain.map(turno => {
      // Calculamos el costo "en el aire" usando el Motor de Costos.
      const calculoCosto = this.motorCostos.calcularPara(turno, paciente);
      return TurnoMapper.toResponseDTO(turno, calculoCosto);
    });

    // Si había que ordenar por costo, ordenamos el array Mapeado en memoria y luego cortamos (slice)
    if (sortBy === 'costo') {
      dtosMapeados.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.costoEstimado - a.costoEstimado;
        }
        return a.costoEstimado - b.costoEstimado;
      });

      // Aplicar paginación manual
      const startIndex = (page - 1) * limit;
      const paginatedResults = dtosMapeados.slice(startIndex, startIndex + limit);
      
      return {
        data: paginatedResults,
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      };
    }

    // Si ya vino ordenado/paginado de BD, devuelvo los mapeados tal cual.
    return {
      data: dtosMapeados,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit)
    };
  }
}

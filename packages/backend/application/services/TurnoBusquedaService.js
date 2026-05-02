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

    // Estrategia híbrida
    if (sortBy !== 'costo') {
      // Orden por fecha u otro campo persistente, delegar totalmente a DB
      const queryResult = await this.repository.buscar(spec, { sortBy, sortOrder }, { page, limit });
      resultadosDomain = queryResult.data;
      totalItems = queryResult.total;
    } else {
      // Orden por costo, no podemos delegar a DB porque el costo se calcula en memoria per-paciente.
      // Traemos TODO lo que cumple el filtro. Cuidado con límites de sistema real.
      logger.info('Ordenamiento por costo interactuando con MotorCostos. Traemos todas las coincidencias previo a la paginación.');
      const allMatches = await this.repository.buscar(spec, null, null); 
      
      if (allMatches.total > MAX_RESULTADOS_COSTO) {
        throw new Error('Demasiados resultados para ordenar por costo. Aplicá más filtros.');
      }
      
      resultadosDomain = allMatches.data;
      totalItems = allMatches.total;
    }

    // Calcular costos para la página actual o todos (si hay que ordenar por costo)
    const dtosMapeados = resultadosDomain.map(turno => {
      if (!turno.practica && !turno.especialidad) {
        throw new Error('Inconsistencia: turno sin prestación');
      }
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

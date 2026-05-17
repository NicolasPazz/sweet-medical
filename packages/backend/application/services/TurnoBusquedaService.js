import { FiltroBusquedaSpecification } from '../../domain/busqueda/FiltroBusquedaSpecification.js';
import { BadRequestError } from '../../errors/AppError.js';

const MAX_RESULTADOS_COSTO = 500;

export class TurnoBusquedaService {
  constructor(busquedaTurnosRepository, motorCostos) {
    this.repository = busquedaTurnosRepository;
    this.motorCostos = motorCostos;
  }

  async buscarTurnos(filtros, paciente, paginacion) {
    const spec = new FiltroBusquedaSpecification(filtros);
    const { page, limit, sortBy, sortOrder } = paginacion;

    let resultadosDomain = [];
    let totalItems = 0;

    if (sortBy !== 'costo') {
      const queryResult = await this.repository.buscar(
        spec,
        { sortBy, sortOrder },
        { page, limit },
      );
      resultadosDomain = queryResult.data;
      totalItems = queryResult.total;
    } else {
      const allMatches = await this.repository.buscar(spec, null, null);

      if (allMatches.total > MAX_RESULTADOS_COSTO) {
        throw new BadRequestError(
          'Demasiados resultados para ordenar por costo. Aplicá más filtros.',
        );
      }

      resultadosDomain = allMatches.data;
      totalItems = allMatches.total;
    }

    const dtosMapeados = resultadosDomain.map((turno) => {
      const esPractica = !!turno.servicio?.codigo;
      const turnoAdaptado = {
        ...turno,
        practica: esPractica ? turno.servicio : null,
        especialidad: !esPractica ? turno.servicio : null,
      };

      const calculoCosto = this.motorCostos.calcularPara(turnoAdaptado, paciente);
      const baseMapeada = this._mapearTurno(turno);

      const dtoFinal = {
        ...baseMapeada,
        costoEstimado: calculoCosto.costoEstimado,
      };

      if (paciente) {
        dtoFinal.cobertura = calculoCosto.tipoCobertura;
      }

      return dtoFinal;
    });

    if (sortBy === 'costo') {
      dtosMapeados.sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.costoEstimado - a.costoEstimado;
        }
        return a.costoEstimado - b.costoEstimado;
      });

      const startIndex = (page - 1) * limit;
      const paginatedResults = dtosMapeados.slice(startIndex, startIndex + limit);

      return {
        data: paginatedResults,
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    }

    return {
      data: dtosMapeados,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  _mapearTurno(t) {
    return {
      id_turno: t.id || t._id,
      id_medico: t.medico ? t.medico.id || t.medico._id : 'N/A',
      id_paciente: t.paciente ? t.paciente.id || t.paciente._id : 'N/A',
      fechaHora: t.fechaHora ? t.fechaHora : 'N/A',
      sede: t.sede ? t.sede.nombre || t.sede : 'N/A',

      servicio: t.servicio
        ? t.servicio.codigo
          ? `${t.servicio.codigo} - ${t.servicio.nombre}`
          : t.servicio.nombre
        : 'N/A',

      estado:
        typeof t.estado?.getEstadNombre === 'function'
          ? t.estado.getEstadoNombre()
          : typeof t.estado?.getEstadoNombre === 'function'
            ? t.estado.getEstadoNombre()
            : t.estado || 'N/A',

      historialEstados: Array.isArray(t.historialEstados)
        ? t.historialEstados.map((historialEstado) => ({
            fechaHoraCambio: historialEstado.fechaHoraIngreso,
            estado: historialEstado.estado,
            motivo: historialEstado.motivo,
            actor: historialEstado.usuario?.nombreUsuario,
          }))
        : [],
      costo: t.costo,
      diaSemana: t.diaSemana,
      hora: t.hora,
    };
  }
}

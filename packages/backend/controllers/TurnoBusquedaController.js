import { logger } from '../domain/utils/logger.js';

export class TurnoBusquedaController {

  static crear(turnoBusquedaService) {
    return async (req, res, next) => {
      try {
        const {
          profesionalId,
          especialidad,
          practica,
          sede,
          fechaDesde,
          fechaHasta,
          page = '1',
          limit = '10',
          sortBy = 'fecha',
          sortOrder = 'asc'
        } = req.query;

        // Parseo
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        // Validaciones - Errores de usuario
        if (isNaN(pageInt) || pageInt < 1) {
          throw new Error('Page debe ser numérico mayor a 0');
        }

        if (isNaN(limitInt) || limitInt <= 0) {
          throw new Error('Limit debe ser numérico mayor a 0');
        }

        const sortOrderNormalized = sortOrder.toLowerCase();
        if (!['asc', 'desc'].includes(sortOrderNormalized)) {
          throw new Error('sortOrder debe ser asc o desc');
        }

        const sortByNormalized = sortBy.toLowerCase();
        if (!['fecha', 'costo'].includes(sortByNormalized)) {
          throw new Error('sortBy debe ser fecha o costo');
        }

        if (fechaDesde && isNaN(new Date(fechaDesde).getTime())) {
          throw new Error('fechaDesde no es una fecha válida');
        }

        if (fechaHasta && isNaN(new Date(fechaHasta).getTime())) {
          throw new Error('fechaHasta no es una fecha válida');
        }

        if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
          throw new Error('fechaDesde no puede ser posterior a fechaHasta');
        }

        // Armado de objetos
        const filtros = {
          profesionalId,
          especialidad,
          practica,
          sede,
          fechaDesde,
          fechaHasta
        };

        const paginacion = {
          page: pageInt,
          limit: limitInt,
          sortBy: sortByNormalized,
          sortOrder: sortOrderNormalized
        };

        // Si existe un usuario autenticado, obtenemos el paciente. Caso contrario, null.
        const paciente = req.user?.paciente ?? null;

        // Llamada al service
        const resultado = await turnoBusquedaService.buscarTurnos(
          filtros,
          paciente,
          paginacion
        );

        // Response OK
        return res.status(200).json({
          status: 'success',
          ...resultado
        });

      } catch (error) {
        logger.error(error);

        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }
    };
  }
}
import { BadRequestError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { PacienteModel } from '../infrastructure/schemas/PacienteSchema.js';
import { turnoBusquedaService } from "../services/TurnoBusquedaService.js";

export class TurnoBusquedaController {

  constructor({
        turnoBusquedaService: turnoService = turnoBusquedaService,
      } = {}) {
        this.turnoBusquedaService = turnoService;
      }

  crear() {
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
          sortOrder = 'asc',
          pacienteIdTest,
        } = req.query;

        // Parseo
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        // Validaciones - Errores de usuario
        if (isNaN(pageInt) || pageInt < 1) {
          throw new BadRequestError('Page debe ser numérico mayor a 0');
        }

        if (isNaN(limitInt) || limitInt <= 0) {
          throw new BadRequestError('Limit debe ser numérico mayor a 0');
        }

        const sortOrderNormalized = sortOrder.toLowerCase();
        if (!['asc', 'desc'].includes(sortOrderNormalized)) {
          throw new BadRequestError('sortOrder debe ser asc o desc');
        }

        const sortByNormalized = sortBy.toLowerCase();
        if (!['fecha', 'costo'].includes(sortByNormalized)) {
          throw new BadRequestError('sortBy debe ser fecha o costo');
        }

        if (fechaDesde && isNaN(new Date(fechaDesde).getTime())) {
          throw new BadRequestError('fechaDesde no es una fecha válida');
        }

        if (fechaHasta && isNaN(new Date(fechaHasta).getTime())) {
          throw new BadRequestError('fechaHasta no es una fecha válida');
        }

        if (fechaDesde && fechaHasta && new Date(fechaDesde) > new Date(fechaHasta)) {
          throw new BadRequestError('fechaDesde no puede ser posterior a fechaHasta');
        }

        // Armado de objetos
        const filtros = {
          profesionalId,
          especialidad,
          practica,
          sede,
          fechaDesde,
          fechaHasta,
        };

        const paginacion = {
          page: pageInt,
          limit: limitInt,
          sortBy: sortByNormalized,
          sortOrder: sortOrderNormalized,
        };

        // TODO: A futuro la idea es que el paciente se extraiga estrictamente del token JWT (req.user.paciente).
        // Para pruebas de la entrega sin frontend, permitimos enviar pacienteIdTest por query params
        let paciente = req.user?.paciente ?? null;
        
        if (!paciente && pacienteIdTest) {
          paciente = await PacienteModel.findById(pacienteIdTest).populate('plan');
        }

        // Llamada al service
        const resultado = await this.turnoBusquedaService.buscarTurnos(filtros, paciente, paginacion);

        // Response OK
        return res.status(200).json({
          status: 'success',
          ...resultado,
        });
      } catch (error) {
        logger.error(error.message);
        return next(error);
      }
    };
  }
}

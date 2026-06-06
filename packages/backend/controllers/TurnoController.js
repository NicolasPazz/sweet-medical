import { BadRequestError } from '../errors/AppError.js';
import { TurnoService } from '../services/TurnoService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { logger } from '../utils/Logger.js';

export class TurnoController {
  constructor({ turnoService = new TurnoService() } = {}) {
    this.turnoService = turnoService;
    this.pacienteRepository = pacienteRepository;
  }

  reservarTurno = async (req, res, next) => {
    try {
      const dtoReserva = req.body;

      ValidadorId.validarIds(dtoReserva.id_usuario);
      ValidadorId.validarIds(dtoReserva.id_servicio);

      await this.turnoService.reservarTurno(dtoReserva);

      return res.status(200).json({ status: 'success', message: 'Turno reservado exitosamente' });
    } catch (error) {
      return next(error);
    }
  };

  cancelarTurnoPaciente = async (req, res, next) => {
    return this.cancelarTurno(req, res, next, false);
  };

  cancelarTurnoMedico = async (req, res, next) => {
    return this.cancelarTurno(req, res, next, true);
  };

  cancelarTurno = async (req, res, next, esMedico) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);
      const { motivo } = req.body;

      if (motivo == null) {
        throw new BadRequestError('Debe escribir algún motivo');
      }

      await this.turnoService.cancelarTurno(idUsuario, idTurno, esMedico, motivo);

      return res.status(200).json({ status: 'success', message: 'Turno cancelado exitosamente' });
    } catch (error) {
      return next(error);
    }
  };

  obtenerHistorial = async (req, res, next) => {
    try {
      const dniPaciente = req.params.dni_paciente;
      ValidadorId.validarIds(idPaciente);
      const idMedico = req.params.id_usuario;
      ValidadorId.validarIds(idMedico);

      const historial = await this.turnoService.obtenerHistorial(dniPaciente, idMedico);

      return res.status(200).json({
        status: 'success',
        data: historial,
      });
    } catch (error) {
      return next(error);
    }
  };

  finalizarTurno = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      await this.turnoService.finalizarTurno(idUsuario, idTurno);

      return res.status(200).json({ status: 'success', message: 'Turno finalizado exitosamente' });
    } catch (error) {
      return next(error);
    }
  };

  confirmarTurno = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      const idSede = req.body.id_sede;

      if (idSede) {
        ValidadorId.validarIds(idSede);
      }

      await this.turnoService.confirmarTurno(idUsuario, idTurno, idSede);

      return res.status(200).json({ status: 'success', message: 'Turno confirmado exitosamente' });
    } catch (error) {
      return next(error);
    }
  };

  obtenerDisponibilidad = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idServicio = req.params.id_servicio;
      ValidadorId.validarIds(idServicio);

      const disponibilidad = await this.turnoService.obtenerDisponibilidad(idUsuario, idServicio);

      return res.status(200).json({
        status: 'success',
        data: disponibilidad,
      });
    } catch (error) {
      return next(error);
    }
  };

  obtenerTurnosMedico = async (req, res, next) => {
    try {
      const idMedico = req.params.id_usuario;
      ValidadorId.validarIds(idMedico);

      const turnos = await this.turnoService.obtenerTurnosMedico(idMedico);

      return res.status(200).json({
        status: 'success',
        data: turnos,
      });
    } catch (error) {
      return next(error);
    }
  };

  obtenerSlotsMedico = async (req, res, next) => {
    try {
      const idMedico = req.params.id_usuario;
      ValidadorId.validarIds(idMedico);

      const slots = await this.turnoService.obtenerSlotsMedico(idMedico);

      return res.status(200).json({
        status: 'success',
        data: slots,
      });
    } catch (error) {
      return next(error);
    }
  };

  getAll = async (req, res, next) => {
    try {
      const turnos = await this.turnoService.getAll();

      return res.status(200).json({
        status: 'success',
        data: turnos,
      });
    } catch (error) {
      return next(error);
    }
  };

  proponerReprogramacion = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      const { fecha, hora, motivo } = req.body;

      if (!fecha || !hora || !motivo) {
        throw new BadRequestError('Faltan datos obligatorios (fecha, hora o motivo)');
      }

      // Convertimos fecha y hora a un objeto Date
      const [dia, mes, anio] = fecha.split('/').map(Number);
      const [horas, minutos] = hora.split(':').map(Number);
      const nuevaFechaHora = new Date(anio, mes - 1, dia, horas, minutos, 0);

      // Validamos que el formateo haya dado una fecha coherente
      if (isNaN(nuevaFechaHora.getTime())) {
        throw new BadRequestError('El formato de fecha u hora es inválido. Use DD/MM/AAAA y HH:MM');
      }

      // Delegamos la lógica al Service
      await this.turnoService.proponerReprogramacion(idUsuario, idTurno, nuevaFechaHora, motivo);

      return res.status(200).json({
        status: 'success',
        message: 'Propuesta de reprogramación registrada y notificación enviada',
      });
    } catch (error) {
      return next(error);
    }
  };

  responderReprogramacion = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      const { aceptado } = req.body;

      if (aceptado === undefined || typeof aceptado !== 'boolean') {
        throw new BadRequestError(
          'Debe indicar si la propuesta fue aceptada (true/false) en el body',
        );
      }

      // Delegamos la resolución al Service
      await this.turnoService.responderReprogramacion(idUsuario, idTurno, aceptado);

      const mensajeFinal = aceptado
        ? 'El turno ha sido reprogramado con éxito'
        : 'La propuesta de reprogramación fue rechazada';

      return res.status(200).json({
        status: 'success',
        message: mensajeFinal,
      });
    } catch (error) {
      return next(error);
    }
  };

  buscarTurnos() {
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
          sortBy = 'costo',
          sortOrder = 'asc',
          pacienteId,
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

        let paciente = req.user?.paciente ?? null;

        if (!paciente && pacienteId) {
          paciente = await this.pacienteRepository.findById(pacienteId);

          if (!paciente) {
            throw new BadRequestError('Paciente no encontrado con el ID proporcionado');
          }
        }

        // Llamada al service
        const resultado = await this.turnoService.buscarTurnos(filtros, paciente, paginacion);

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

  obtenerFechasDisponibles() {
    return async (req, res, next) => {
      try {
        const { especialidad, practica, profesionalId } = req.query;

        const filtros = { especialidad, practica, profesionalId };

        const resultado = await this.turnoService.buscarFechasDisponibles(filtros);

        return res.status(200).json({
          status: 'success',
          data: resultado.fechas,
        });
      } catch (error) {
        logger.error(error.message);
        return next(error);
      }
    };
  }

  obtenerHorariosDisponibles() {
    return async (req, res, next) => {
      try {
        const { especialidad, practica, profesionalId, fecha } = req.query;

        if (!fecha) throw new BadRequestError('Falta el parámetro fecha');

        const filtros = {
          especialidad,
          practica,
          profesionalId,
          fechaDesde: fecha,
          fechaHasta: fecha,
        };

        const resultado = await this.turnoService.buscarHorariosDisponibles(filtros);

        return res.status(200).json({
          status: 'success',
          data: resultado.horarios,
        });
      } catch (error) {
        logger.error(error.message);
        return next(error);
      }
    };
  }
}

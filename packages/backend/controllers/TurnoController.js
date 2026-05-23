import { BadRequestError } from '../errors/AppError.js';
import { TurnoService } from '../services/TurnoService.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class TurnoController {
  constructor({ turnoService = new TurnoService() } = {}) {
    this.turnoService = turnoService;
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
      const idPaciente = req.params.id_paciente;
      ValidadorId.validarIds(idPaciente);
      const idMedico = req.params.id_usuario;
      ValidadorId.validarIds(idMedico);

      const historial = await this.turnoService.obtenerHistorial(idPaciente, idMedico);

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
    
    const idSede = req.params.id_sede;
    ValidadorId.validarIds(idSede);

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
}

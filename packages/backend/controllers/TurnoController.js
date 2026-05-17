import { BadRequestError } from '../errors/AppError.js';
import { TurnoService } from '../services/TurnoService.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class TurnoController {
  constructor({ turnoService = new TurnoService() } = {}) {
    this.turnoService = turnoService;
  }

  reservarTurno = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      await this.turnoService.reservarTurno(idUsuario, idTurno);

      return res.status(200).json({ status: 'success' });
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

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      return next(error);
    }
  };

  obtenerHistorial = async (req, res, next) => {
    try {
      const idPaciente = req.params.id_paciente;
      ValidadorId.validarIds(idPaciente);
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);

      const historial = await this.turnoService.obtenerHistorial(idPaciente, idUsuario);

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

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      return next(error);
    }
  };

  aceptarTurno = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;
      ValidadorId.validarIds(idUsuario);
      const idTurno = req.params.id_turno;
      ValidadorId.validarIds(idTurno);

      await this.turnoService.aceptarTurno(idUsuario, idTurno);

      return res.status(200).json({ status: 'success' });
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
      const idMedico = req.params.id_medico;
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
}

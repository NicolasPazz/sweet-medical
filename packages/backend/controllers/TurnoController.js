import { BadRequestError } from '../errors/AppError.js';
import { TurnoService } from '../services/TurnoService.js';
import { ValidadorId } from '../domain/utils/ValidadorId.js';

export class TurnoController {
  constructor({ turnoService = new TurnoService() } = {}) {
    this.turnoService = turnoService;
  }

  reservarTurno = async (req, res, next) => {
    try {
      const idUsuario = this.parsearId(req.params.id_usuario);
      const idTurno = this.parsearId(req.params.id_turno);

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
      const idUsuario = this.parsearId(req.params.id_usuario);
      const idTurno = this.parsearId(req.params.id_turno);
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
      const idPaciente = this.parsearId(req.params.id_paciente);
      const idUsuario = this.parsearId(req.params.id_usuario);

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
      const idUsuario = this.parsearId(req.params.id_usuario);
      const idTurno = this.parsearId(req.params.id_turno);

      await this.turnoService.finalizarTurno(idUsuario, idTurno);

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      return next(error);
    }
  };

  obtenerDisponibilidad = async (req, res, next) => {
    try {
      const idUsuario = this.parsearId(req.params.id_usuario);
      const idServicio = this.parsearId(req.params.id_servicio);

      const disponibilidad = await this.turnoService.obtenerDisponibilidad(idUsuario, idServicio);

      return res.status(200).json({
        status: 'success',
        data: disponibilidad,
      });
    } catch (error) {
      return next(error);
    }
  };

  getAllOfMedic = async (req, res, next) => {
    try {
      const idMedico = this.parsearId(req.params.id_medico);

      const turnos = await this.turnoService.getAllOfMedic(idMedico);

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

  parsearId(valor) {
    ValidadorId.validarIds(valor);
    return valor;
  }
}

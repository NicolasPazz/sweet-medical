import { NotificacionService } from '../services/NotificacionService.js';
import { ValidadorId } from '../domain/utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class NotificacionController {
  constructor({ notificacionService = new NotificacionService() } = {}) {
    this.notificacionService = notificacionService;
  }

  obtenerLeidas = async (req, res, next) => {
    try {
      const idUsuario = req.params.idUsuario;
      ValidadorId.validarIds(idUsuario);

      const resultado = await this.notificacionService.obtenerLeidas(idUsuario);
      return res.status(200).json({
        status: 'success',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  obtenerNoLeidas = async (req, res, next) => {
    try {
      const idUsuario = req.params.idUsuario;
      ValidadorId.validarIds(idUsuario);

      const resultado = await this.notificacionService.obtenerNoLeidas(idUsuario);
      return res.status(200).json({
        status: 'success',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  marcarComoLeida = async (req, res, next) => {
    try {
      const id = req.params.id;
      ValidadorId.validarIds(id);
      const idUsuario = req.body.idUsuario;
      ValidadorId.validarIds(idUsuario);
      const resultado = await this.notificacionService.marcarComoLeida(id, idUsuario);
      return res.status(200).json({
        status: 'success',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  save = async (req, res, next) => {
    try {
      const datosNotificacion = this.extraerYValidarBodyNotificacion(req.body);
      const resultado = await this.notificacionService.save(datosNotificacion);
      return res.status(201).json({
        status: 'created',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  extraerYValidarBodyNotificacion(body) {
    const destinatario = body.destinatario;
    ValidadorId.validarIds(destinatario);
    const remitente = body.remitente;
    ValidadorId.validarIds(remitente);

    if (typeof body.mensaje !== 'string' || body.mensaje.trim().length === 0) {
      throw new BadRequestError('El mensaje no puede estar vacío');
    }

    return {
      destinatario,
      remitente,
      mensaje: body.mensaje.trim(),
    };
  }
}

import { notificacionService } from '../services/NotificacionService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class NotificacionController {
  constructor({ notificacionService: svc = notificacionService } = {}) {
    this.notificacionService = svc;
  }

  obtenerLeidas = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const idUsuario = usuario.id;
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
      const usuario = req.usuarioAutenticado;
      const idUsuario = usuario.id;
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
      const id = req.params.id_notificacion;
      ValidadorId.validarIds(id);
      const usuario = req.usuarioAutenticado;
      const idUsuario = usuario.id;
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

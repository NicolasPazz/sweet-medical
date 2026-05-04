import { logger } from "../domain/utils/logger.js";
import { NotificacionService } from "../services/NotificacionService.js";

export class NotificacionController {
  constructor({ notificacionService = new NotificacionService() } = {}) {
    this.notificacionService = notificacionService;
  }

  obtenerLeidas = async (req, res) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      const resultado = await this.notificacionService.obtenerLeidas(idUsuario);
      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  obtenerNoLeidas = async (req, res) => {
    try {
      const idUsuario = Number(req.params.idUsuario);
      const resultado = await this.notificacionService.obtenerNoLeidas(idUsuario);
      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  marcarComoLeida = async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resultado = await this.notificacionService.marcarComoLeida(id);
      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  save = async (req, res) => {
    try {
      const datosNotificacion = this.extraerYValidarBodyNotificacion(req.body);
      const resultado = await this.notificacionService.save(datosNotificacion);
      return res.status(201).json({
        status: "created",
        data: resultado,
      });
    } catch (error) {
      logger.error("SOY EL ERROR: " + error);
    }
  };

  extraerYValidarBodyNotificacion(body) {
    // TODO validaciones
    return {
      destinatario: body.destinatario,
      remitente: body.remitente,
      mensaje: body.mensaje,
    };
  }
}

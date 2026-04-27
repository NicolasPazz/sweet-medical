import { logger } from "../domain/utils/logger.js";
import { NotificacionService } from "../services/NotificacionService.js";
import { Notificacion } from "../domain/notificacion/Notificacion.js";

export class NotificacionController {
  constructor({ notificacionService = new NotificacionService() } = {}) {
    this.notificacionService = notificacionService;
  }

  obtenerNoLeidas = async (req, res) => {
    try {
      const idUsuario = Number(req.params.id);
      const resultado = this.notificacionService.obtenerNoLeidas(idUsuario);
      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (error) {
      logger.error(error);
    }
  };

  guardar = async (req, res) => {
    try {
      const { destinatario, remitente, mensaje } = req.body;
      const notificacion = new Notificacion(destinatario, remitente, mensaje);
      const resultado = this.notificacionService.guardar(notificacion);
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

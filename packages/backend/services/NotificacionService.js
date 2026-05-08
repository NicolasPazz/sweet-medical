import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { Notificacion } from "../domain/notificacion/Notificacion.js";
import { NotFoundError } from "../errors/AppError.js";
import { ValidadorId } from "../domain/utils/ValidadorId.js";

export class NotificacionService {
  constructor({ notificacionRepository = new NotificacionRepository() } = {}) {
    this.notificacionRepository = notificacionRepository;
    this.usuarioRepository = usuarioRepository;
  }

  obtenerLeidas(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    return this.notificacionRepository.obtenerLeidas(idUsuario);
  }

  obtenerNoLeidas(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    return this.notificacionRepository.obtenerNoLeidas(idUsuario);
  }

  marcarComoLeida(id, idUsuario) {
    ValidadorId.validarIds(id, idUsuario);

    const notificacion = this.notificacionRepository.findById(id);

    if (!notificacion) {
      throw new NotFoundError("Notificación no encontrada");
    }

    if (notificacion.destinatario !== idUsuario) {
      throw new NotFoundError("Notificación no encontrada");
    }

    return this.notificacionRepository.marcarComoLeida(id);
  }

  save(datosNotificacion) {
    ValidadorId.validarIds(datosNotificacion.destinatario, datosNotificacion.remitente);

    const notificacion = new Notificacion(
      datosNotificacion.destinatario,
      datosNotificacion.remitente,
      datosNotificacion.mensaje
    );
    return this.notificacionRepository.save(notificacion);
  }
}

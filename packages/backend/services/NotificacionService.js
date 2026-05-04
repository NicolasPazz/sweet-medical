import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { Notificacion } from "../domain/notificacion/Notificacion.js";
export class NotificacionService {
  constructor({ notificacionRepository = new NotificacionRepository() } = {}) {
    this.notificacionRepository = notificacionRepository;
  }

  obtenerLeidas(idUsuario) {
    return this.notificacionRepository.obtenerLeidas(idUsuario);
  }

  obtenerNoLeidas(idUsuario) {
    return this.notificacionRepository.obtenerNoLeidas(idUsuario);
  }

  marcarComoLeida(id) {
    // UPDATE de la notificación ya guardada
    return this.notificacionRepository.marcarComoLeida(id);
  }

  save(datosNotificacion) {
    const notificacion = new Notificacion(
      datosNotificacion.destinatario,
      datosNotificacion.remitente,
      datosNotificacion.mensaje
    );
    return this.notificacionRepository.save(notificacion);
  }
}

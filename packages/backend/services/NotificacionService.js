import { NotificacionRepository } from "../repositories/NotificacionRepository.js";

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

  guardar(notificacion) {
    return this.notificacionRepository.guardar(notificacion);
  }
}

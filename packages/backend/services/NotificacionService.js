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

  guardar(notificacion) {
    return this.notificacionRepository.guardar(notificacion);
  }
}

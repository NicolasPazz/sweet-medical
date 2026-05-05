import { Notificacion } from "../domain/notificacion/Notificacion.js";
import { NotFoundError, BadRequestError } from "../errors/AppError.js";

export class NotificacionRepository {
  constructor() {
    this.notificaciones = {};
    this.nextId = 1;
  }

  findById(id) {
    return this.notificaciones[id] ?? null;
  }

  save(notificacion) {
    if (!(notificacion instanceof Notificacion)) {
      throw new BadRequestError("La notificación es inválida");
    }

    const id = notificacion.id ?? this.nextId++;
    notificacion.id = id;
    this.notificaciones[id] = notificacion;
    return notificacion;
  }

  obtenerLeidas(idUsuario) {
    return Object.values(this.notificaciones).filter(
      (notificacion) => notificacion.destinatario === idUsuario && notificacion.leida === true
    );
  }

  obtenerNoLeidas(idUsuario) {
    return Object.values(this.notificaciones).filter(
      (notificacion) => notificacion.destinatario === idUsuario && notificacion.leida === false
    );
  }

  marcarComoLeida(id) {
    const notificacion = this.notificaciones[id];

    if (!notificacion) {
      throw new NotFoundError("Notificación no encontrada");
    }

    notificacion.marcarComoLeida();
    return notificacion;
  }
}

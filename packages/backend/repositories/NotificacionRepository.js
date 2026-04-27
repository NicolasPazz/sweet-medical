import "../domain/notificacion/Notificacion.js";

export class NotificacionRepository {
  constructor() {
    this.notificaciones = {};
    this.nextId = 1;
  }

  guardar(notificacion) {
    const id = notificacion.id ?? this.nextId++;
    notificacion.id = id;
    this.notificaciones[id] = notificacion;
    return notificacion;
  }

  obtenerNoLeidas(idUsuario) {
    return Object.values(this.notificaciones).filter(
      (notificacion) => notificacion.destinatario === idUsuario && notificacion.leida === false
    );
  }
}

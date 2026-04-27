import "../domain/notificacion/Notificacion.js";

export class NotificacionRepository {
  constructor() {
    this.notificaciones = {};
    this.nextId = 1;
  }

  findById(id) {
    return this.notificaciones[id] ?? null;
  }

  guardar(notificacion) {
    const id = notificacion.id ?? this.nextId++;
    notificacion.id = id;
    this.notificaciones[id] = notificacion;
    return notificacion;
  }

  obtenerLeidas(idUsuario) {
    const leidas = Object.values(this.notificaciones).filter(
      (notificacion) => notificacion.destinatario.id === idUsuario && notificacion.leida === true
    );

    return leidas;
  }

  obtenerNoLeidas(idUsuario) {
    const noLeidas = Object.values(this.notificaciones).filter(
      (notificacion) => notificacion.destinatario.id === idUsuario && notificacion.leida === false
    );

    return noLeidas;
  }

  marcarComoLeida(id) {
    const notificacion = this.notificaciones[id];
    notificacion.marcarComoLeida();
    return notificacion;
  }
}

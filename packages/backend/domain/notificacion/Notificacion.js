import { logger } from '../../utils/logger.js';

export class Notificacion {
  // MongoDB va a agregar _id al documento cuando lo insertes, no necesitás anticiparlo en la clase.
  // De ser necesario el acceso a ids en métodos de las clases del dominio, ahí se declara:
  id;
  destinatario;
  remitente;
  mensaje;
  fechaHoraCreacion;
  fechaHoraLeida;
  leida;

  constructor(destinatario, remitente, mensaje) {
    this.destinatario = destinatario;
    this.remitente = remitente;
    this.mensaje = mensaje;
    this.fechaHoraCreacion = new Date();
    this.fechaHoraLeida = null;
    this.leida = false;
  }

  marcarComoLeida() {
    this.leida = true;
    this.fechaHoraLeida = new Date();

    logger.debug(
      `Notificación ${this.id || 'sin ID'} marcada como leída el: ${this.fechaHoraLeida.toLocaleString('es-AR')}`,
    );
  }
}

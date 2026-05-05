import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";

export class Cancelado {
  id;
  constructor(turno) {
    this.turno = turno;
  }
  notificar(remitente) {
    const actor = this.turno.obtenerUltimoActor();
    const servicio = this.turno.obtenerNombreServicio();
    // Ante cancelaciones de turnos, se notifica a la contraparte correspondiente.
    if (actor && actor.id === this.turno.paciente.usuario.id) {
      logger.debug(
        `Creando notificación para turno ${this.turno.id} en estado CANCELADO por paciente ${this.turno.paciente.nombre} para servicio ${servicio}.`
      );
      return new Notificacion(
        this.turno.medico.usuario,
        remitente,
        `El paciente ${this.turno.paciente.nombre} ha cancelado su turno para ${servicio}.`
      );
    } else {
      logger.debug(
        `Creando notificación para turno ${this.turno.id} en estado CANCELADO por profesional ${this.turno.medico.nombre} para servicio ${servicio}.`
      );
      return new Notificacion(
        this.turno.paciente.usuario,
        remitente,
        `El profesional ha cancelado su turno del dia ${this.turno.fechaHora} en ${this.turno.sede?.nombre ?? 'N/A'} para ${servicio}.`
      );
    }
  }
}

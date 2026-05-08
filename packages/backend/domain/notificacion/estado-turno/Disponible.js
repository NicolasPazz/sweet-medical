import { logger } from "../../utils/logger.js";

export class Disponible {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(_remitente) {
    // Si el estado es DISPONIBLE o REALIZADO, no hay notificación
    logger.debug(
      `No se crea notificación para turno ${this.turno.id} en estado ${this.turno.estado.constructor.name}.`
    );
    return null;
  }
}

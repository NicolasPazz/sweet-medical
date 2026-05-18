import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { tLog } from "../../utils/i18n/i18n.js";
import { logger } from '../../../utils/logger.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';

export class Realizado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.REALIZADO;
  }

  notificar() {
    // Si el estado es DISPONIBLE o REALIZADO, no hay notificación
    logger.debug(
      `No se crea notificación para turno ${this.turno.id} en estado ${this.turno.estado.constructor.name}.`,
    );
    return null;
  }
}
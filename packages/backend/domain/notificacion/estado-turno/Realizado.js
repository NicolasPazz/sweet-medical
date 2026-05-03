import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { tLog } from "../../utils/i18n/i18n.js";

export class Realizado {
  id;
  constructor(turno) {
    this.turno = turno;
  }
  notificar(_remitente) {
    logger.debug(
      tLog('LOG_SIN_NOTIFICACION', { 
        id: this.turno.id, 
        estado: this.turno.estado 
      })
    );
    return null;
  }
}
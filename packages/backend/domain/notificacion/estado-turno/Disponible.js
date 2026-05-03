import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { tLog } from "../../utils/i18n/i18n.js";

export class Disponible {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(_remitente) {
    // Se generará en el idioma configurado en IDIOMA_PARA_LOGS
    logger.debug(
      tLog('LOG_SIN_NOTIFICACION', { 
        id: this.turno.id, 
        estado: this.turno.estado 
      })
    );
    
    return null;
  }
}
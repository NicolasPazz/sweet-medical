import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

export class Reservado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();

    logger.debug(
      tLog('LOG_RESERVA_PACIENTE', {
        id: this.turno.id,
        nombre: this.turno.paciente.nombre,
        servicio
      })
    );

    return new Notificacion(
      this.turno.medico.usuario,
      remitente,
      tNegocio('RESERVA_A_MEDICO', {
        nombre: this.turno.paciente.nombre,
        servicio
      })
    );
  }
}
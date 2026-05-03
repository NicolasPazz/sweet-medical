import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { Usuario } from "../usuarios/Usuario.js";
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

export class Confirmado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();

    // LOG: Registro técnico en el idioma configurado para el sistema (ej: 'es')
    logger.debug(
      tLog('LOG_CONFIRMACION_PROFESIONAL', {
        id: this.turno.id,
        nombre: this.turno.medico.nombre,
        servicio: servicio
      })
    );

    // NOTIFICACIÓN: Mensaje al paciente en el idioma de negocio (ej: 'en')
    return new Notificacion(
      this.turno.paciente.usuario,
      remitente,
      tNegocio('CONFIRMACION_TURNO_DETALLADA', {
        servicio: servicio,
        fecha: this.turno.fechaHora.toLocaleDateString(),
        sede: this.turno.sede.nombre,
        medico: this.turno.medico.nombre
      })
    );
  }
}
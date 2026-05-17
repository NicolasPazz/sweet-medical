import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

export class Confirmado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.CONFIRMADO;
  }

  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();

    // LOG: Registro técnico en el idioma configurado para el sistema (ej: 'es')
    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado CONFIRMADO por profesional ${this.turno.medico.nombre} para servicio ${servicio}.`,
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
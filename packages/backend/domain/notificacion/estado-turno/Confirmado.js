import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';
import { t } from '../../../utils/i18n/i18n.js'; // <-- Cambiado a 't'

export class Confirmado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.CONFIRMADO;
  }

  generarNotificacion(remitente) {
    const servicio = this.turno.obtenerNombreServicio();

    // LOG: Registro técnico en consola
    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado CONFIRMADO por profesional ${this.turno.medico.nombre} para servicio ${servicio}.`,
    );

    // NOTIFICACIÓN: Mensaje traducido dinámicamente para el paciente
    return new Notificacion(
      this.turno.paciente.usuario,
      remitente,
      t('CONFIRMACION_TURNO_DETALLADA', {
        servicio: servicio,
        fecha: this.turno.fechaHora?.toLocaleDateString() || '',
        sede: this.turno.sede.nombre,
        medico: this.turno.medico.nombre,
        interpolation: { escapeValue: false } // <- Evita que cambie las "/" por "&#x2F;"
      }),
    );
  }
}

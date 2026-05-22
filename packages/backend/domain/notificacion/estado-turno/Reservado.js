import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { t } from '../../../utils/i18n/i18n.js'; // <-- Unificado a 't'
import { EstadoTurno } from '../../turno/EstadoTurno.js';

export class Reservado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.RESERVADO;
  }

  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();

    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado RESERVADO por paciente ${this.turno.paciente.nombre} para servicio ${servicio}.`,
    );

    // Mantenemos tu corrección clave de IDs limpios para Mongoose
    const destinatarioId = this.turno.medico.usuario.id || this.turno.medico.usuario._id;
    const remitenteId = remitente.id || remitente._id;

    return new Notificacion(
      destinatarioId,
      remitenteId,
      t('RESERVA_A_MEDICO', {
        // <-- Cambiado a 't'
        nombre: this.turno.paciente.nombre,
        servicio,
      }),
    );
  }
}

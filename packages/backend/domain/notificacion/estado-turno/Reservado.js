import { logger } from '../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';

export class Reservado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(remitente) {
    // Se notifica al médico indicando paciente y servicio solicitado (especialidad o práctica).
    const servicio = this.turno.obtenerNombreServicio();
    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado RESERVADO por paciente ${this.turno.paciente.nombre} para servicio ${servicio}.`,
    );
    return new Notificacion(
      this.turno.medico.usuario,
      remitente,
      `Nuevo turno reservado por paciente ${this.turno.paciente.nombre} para ${servicio}.`,
    );
  }
}

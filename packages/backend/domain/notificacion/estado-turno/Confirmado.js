import { logger } from '../../utils/logger.js';
import { Notificacion } from '../Notificacion';

export class Confirmado {
  id;
  constructor(turno) {
    this.turno = turno;
  }
  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();
    // Al aceptar un turno, se notifica al paciente.
    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado CONFIRMADO por profesional ${this.turno.medico.nombre} para servicio ${servicio}.`,
    );
    return new Notificacion(
      this.turno.paciente.usuario,
      remitente,
      `Su turno para ${servicio} el dia ${this.turno.fechaHora} en ${this.turno.sede.nombre} con el Dr/a. ${this.turno.medico.nombre} ha sido confirmado.`,
    );
  }
}

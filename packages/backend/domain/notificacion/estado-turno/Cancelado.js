import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';

export class Cancelado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.CANCELADO;
  }

  notificar(remitente) {
    const actor = this.turno.obtenerUltimoActor();
    const servicio = this.turno.obtenerNombreServicio();

    // 1. Caso: El paciente cancela (requiere que exista paciente)
    if (this.turno.paciente && actor && actor.id === this.turno.paciente.usuario?.id) {
      logger.debug(`Notificando al médico por cancelación del paciente.`);
      return new Notificacion(
        this.turno.medico.usuario,
        remitente,
        `El paciente ${this.turno.paciente.nombre} ha cancelado su turno para ${servicio}.`,
      );
    }

    // 2. Caso: El profesional o el sistema cancelan
    else {
      // IMPORTANTE: Solo intentamos notificar al paciente SI EXISTE uno
      if (this.turno.paciente) {
        logger.debug(`Notificando al paciente por cancelación del profesional/sistema.`);
        return new Notificacion(
          this.turno.paciente.usuario,
          remitente,
          `El profesional ha cancelado su turno del dia ${this.turno.fechaHora} para ${servicio}.`,
        );
      } else {
        // Si no hay paciente, es un turno libre que se eliminó
        logger.debug(
          `Turno disponible cancelado (ID: ${this.turno.id}). No se requiere notificar paciente.`,
        );
        return null;
      }
    }
  }
}

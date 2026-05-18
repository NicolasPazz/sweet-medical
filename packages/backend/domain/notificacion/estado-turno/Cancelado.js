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

    const actorId = actor?.id || actor?._id;
    const pacienteUsuarioId = this.turno.paciente ? this.turno.paciente.id : null;

    if (
      !(pacienteUsuarioId == null) &&
      this.turno.paciente &&
      actorId &&
      String(actorId) === String(pacienteUsuarioId)
    ) {
      logger.debug(`Notificando al médico por cancelación del paciente.`);
      return new Notificacion(
        this.turno.medico.usuario,
        remitente,
        `El paciente ${this.turno.paciente.nombre} ha cancelado su turno para ${servicio}.`,
      );
    } else {
      if (this.turno.paciente) {
        logger.debug(`Notificando al paciente por cancelación del profesional/sistema.`);
        return new Notificacion(
          this.turno.paciente.usuario,
          remitente,
          `El profesional ha cancelado su turno del dia ${this.turno.fechaHora} para ${servicio}.`,
        );
      } else {
        logger.debug(
          `Turno disponible cancelado (ID: ${this.turno.id}). No se requiere notificar paciente.`,
        );
        return null;
      }
    }
  }
}

import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';
import { t } from "../../../utils/i18n/i18n.js"; // <-- Cambiado a 't'

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
        t('CANCELACION_A_MEDICO', { 
          nombre: this.turno.paciente.nombre, 
          servicio 
        }),
      );
    } else {
      if (this.turno.paciente) {
        logger.debug(`Notificando al paciente por cancelación del profesional/sistema.`);
        return new Notificacion(
          this.turno.paciente.usuario,
          remitente,
          t('CANCELACION_A_PACIENTE', { 
            fecha: this.turno.fechaHora?.toLocaleDateString() || '', 
            servicio 
          }),
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
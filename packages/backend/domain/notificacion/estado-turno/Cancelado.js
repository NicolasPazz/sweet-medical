import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';
import { t } from '../../../utils/i18n/i18n.js'; // <-- Cambiado a 'import { DateUtil } from '../../../utils/DateUtil.js';
import { DateUtil } from '../../../utils/DateUtil.js';
export class Cancelado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.CANCELADO;
  }

  generarNotificacion(remitente, motivo) {
    const actor = this.turno.obtenerUltimoActor();
    const servicio = this.turno.obtenerNombreServicio();

    // obtenerUltimoActor() puede devolver un ObjectId crudo (recién casteado al pushear
    // al historial) y ObjectId.id NO es el hex string sino un buffer interno.
    // Por eso hay que priorizar ._id / el propio valor, y nunca .id.
    const actorId = actor?._id || actor;
    const pacienteUsuarioId = this.turno.paciente
      ? this.turno.paciente.usuario?.id ||
        this.turno.paciente.usuario?._id ||
        this.turno.paciente.usuario
      : null;
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
          fecha:
            DateUtil.toDDMMYYYY(this.turno.fechaHora) +
            ' (' +
            DateUtil.toHHMM(this.turno.fechaHora) +
            ')',
          servicio,
          motivo,
          interpolation: { escapeValue: false },
        }),
      );
    } else {
      if (this.turno.paciente) {
        logger.debug(`Notificando al paciente por cancelación del profesional/sistema.`);
        return new Notificacion(
          this.turno.paciente.usuario,
          remitente,
          t('CANCELACION_A_PACIENTE', {
            nombre: this.turno.medico.nombre,
            fecha: DateUtil.toDDMMYYYY(this.turno.fechaHora) + '(' + this.turno.hora + ')',
            servicio,
            motivo,
            interpolation: { escapeValue: false },
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

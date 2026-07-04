import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { t } from '../../../utils/i18n/i18n.js'; // <-- Cambiado a 't' para unificar
import { EstadoTurno } from '../../turno/EstadoTurno.js';
import { DateUtil } from '../../../utils/DateUtil.js';

export class PendienteReprogramacion {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.PENDIENTE_REPROGRAMACION;
  }

  notificar(remitente, _m) {
    const actor = this.turno.obtenerUltimoActor();
    const servicio = this.turno.obtenerNombreServicio();

    // obtenerUltimoActor() puede devolver un ObjectId crudo (recién casteado al pushear
    // al historial) y ObjectId.id NO es el hex string sino un buffer interno.
    // Por eso hay que priorizar ._id / el propio valor, y nunca .id.
    const actorId = actor?._id || actor;
    const pacienteUsuarioId = this.turno.paciente?.usuario?.id || this.turno.paciente?.usuario?._id;
    const medicoUsuarioId = this.turno.medico?.usuario?.id || this.turno.medico?.usuario?._id;

    const prop = this.turno.propuestaCambio;
    const fechaFormateada = prop ? DateUtil.toDDMMYYYY(prop.nuevaFechaHora) : 'una nueva fecha';

    const motivo = prop?.motivo || 'No especificado';

    // Caso 1: El Paciente solicita el cambio -> Notifica al Médico
    if (this.turno.paciente && actorId && String(actorId) === String(pacienteUsuarioId)) {
      logger.debug(`Notificando al médico por solicitud de reprogramación del paciente.`);
      return new Notificacion(
        this.turno.medico.usuario,
        remitente,
        t('PROPUESTA_REPROGRAMACION_A_MEDICO', {
          nombre: this.turno.paciente.nombre,
          servicio,
          fecha: fechaFormateada,
          motivo,
          interpolation: { escapeValue: false }
        }),
      );
    }

    // Caso 2: El Médico propone el cambio -> Notifica al Paciente
    else if (this.turno.medico && actorId && String(actorId) === String(medicoUsuarioId)) {
      logger.debug(`Notificando al paciente por propuesta de reprogramación del médico.`);
      return new Notificacion(
        this.turno.paciente.usuario,
        remitente,
        t('PROPUESTA_REPROGRAMACION_A_PACIENTE', {
          nombre: this.turno.medico.nombre,
          servicio,
          fecha: fechaFormateada,
          motivo,
          interpolation: { escapeValue: false }
        }),
      );
    } else {
      logger.debug(`Solicitud de reprogramación iniciada por el sistema.`);
      return null;
    }
  }
}

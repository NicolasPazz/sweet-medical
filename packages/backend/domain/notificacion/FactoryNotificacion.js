import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';
import { t } from "../../utils/i18n/i18n.js"; // <-- Cambiado a 't' para unificar

export class FactoryNotificacion {
  static crearSegunEstadoTurno(usuarioQueLlama, turno) {
    return turno.estado.notificar(usuarioQueLlama);
  }

  // Esto se ejecutará desde un cron
  static crearRecordatoriosDiaPrevio(turno, usuarioSistema) {
    const remitenteId = usuarioSistema?.id || usuarioSistema?._id;

    const medicoUsuarioId = turno.medico.usuario.id || turno.medico.usuario._id;
    const pacienteUsuarioId = turno.paciente.usuario.id || turno.paciente.usuario._id;

    return [
      new Notificacion(
        medicoUsuarioId,
        remitenteId,
        t('RECORDATORIO_MEDICO', {
          nombre: turno.paciente.nombre 
        }),
      ),
      new Notificacion(
        pacienteUsuarioId,
        remitenteId,
        t('RECORDATORIO_PACIENTE', {
          nombre: turno.medico.nombre 
        }),
      ),
    ];
  }
}
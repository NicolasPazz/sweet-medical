import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';
import { t } from '../../utils/i18n/i18n.js'; // <-- Cambiado a 't' para unificar

export class FactoryNotificacion {
  static crearSegunEstadoTurno(usuarioQueLlama, turno) {
    return turno.estado.generarNotificacion(usuarioQueLlama);
  }

  static crearRecordatoriosActores(usuarioQueLlama, turno) {
    const notificaciones = [];

    const notificacionPaciente = new Notificacion(
      turno.paciente.usuario,
      usuarioQueLlama,
      t('RECORDATORIO_PACIENTE', {
        nombre: turno.medico.nombre,
      }),
    );
    const notificacionMedico = new Notificacion(
      turno.medico.usuario,
      usuarioQueLlama,
      t('RECORDATORIO_MEDICO', {
        nombre: turno.paciente.nombre,
      }),
    );
    notificaciones.push(notificacionPaciente, notificacionMedico);
    return notificaciones;
  }
}

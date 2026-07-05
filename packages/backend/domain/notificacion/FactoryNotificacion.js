import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';
import { t } from '../../utils/i18n/i18n.js'; // <-- Cambiado a 't' para unificar

export class FactoryNotificacion {
  static crearSegunEstadoTurno(usuario, turno, motivo) {

    console.log("turno.estado:", turno.estado);
    console.log("¿Qué tipo de dato es?:", typeof turno.estado);
    console.log("¿Tiene la función?:", typeof turno.estado.generarNotificacion);

    return turno.estado.generarNotificacion(usuario, motivo);
  }

  static crearRecordatoriosActores(usuario, turno) {
    const notificaciones = [];

    const notificacionPaciente = new Notificacion(
      turno.paciente.usuario,
      usuario,
      t('RECORDATORIO_PACIENTE', {
        nombre: turno.medico.nombre,
      }),
    );
    const notificacionMedico = new Notificacion(
      turno.medico.usuario,
      usuario,
      t('RECORDATORIO_MEDICO', {
        nombre: turno.paciente.nombre,
      }),
    );
    notificaciones.push(notificacionPaciente, notificacionMedico);
    return notificaciones;
  }
}

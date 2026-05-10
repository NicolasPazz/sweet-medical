import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';

export class FactoryNotificacion {
  static crearSegunEstadoTurno(turno) {
    return turno.estado.notificar(Usuario.USUARIO_SISTEMA);
  }

  // Esto se ejecutara desdes un cron
  static crearRecordatoriosDiaPrevio(turno) {
    const remitente = Usuario.USUARIO_SISTEMA;
    return [
      new Notificacion(
        turno.medico.usuario,
        remitente,
        `Recordatorio: Mañana tiene un turno con ${turno.paciente.nombre}.`,
      ),
      new Notificacion(
        turno.paciente.usuario,
        remitente,
        `Recordatorio: Mañana es su turno con el Dr/a. ${turno.medico.nombre}.`,
      ),
    ];
  }
}

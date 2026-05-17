import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';

export class FactoryNotificacion {
  static crearSegunEstadoTurno(usuarioQueLlama, turno) {
    return turno.estado.notificar(usuarioQueLlama);
  }

  // Esto se ejecutará desde un cron
  static crearRecordatoriosDiaPrevio(turno) {
    const remitenteId = Usuario.USUARIO_SISTEMA.id; // Extraemos el ID stático limpio

    const medicoUsuarioId = turno.medico.usuario.id || turno.medico.usuario._id;
    const pacienteUsuarioId = turno.paciente.usuario.id || turno.paciente.usuario._id;

    return [
      new Notificacion(
        medicoUsuarioId,
        remitenteId,
        `Recordatorio: Mañana tiene un turno con ${turno.paciente.nombre}.`,
      ),
      new Notificacion(
        pacienteUsuarioId,
        remitenteId,
        `Recordatorio: Mañana es su turno con el Dr/a. ${turno.medico.nombre}.`,
      ),
    ];
  }
}

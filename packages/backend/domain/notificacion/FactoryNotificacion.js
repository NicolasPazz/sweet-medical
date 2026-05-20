import { Notificacion } from './Notificacion.js';

export class FactoryNotificacion {
  
  static crearSegunEstadoTurno(usuarioQueLlama, turno) {
    return turno.estado.generarNotificacion(usuarioQueLlama);
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

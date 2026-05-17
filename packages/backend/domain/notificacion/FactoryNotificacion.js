import { Notificacion } from './Notificacion.js';
import { Usuario } from '../usuario/Usuario.js';
import { tNegocio } from "../../utils/i18n/i18n.js";

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
        tNegocio('RECORDATORIO_MEDICO', { 
          nombre: turno.paciente.nombre 
        }),
      ),
      new Notificacion(
        pacienteUsuarioId,
        remitenteId,
        tNegocio('RECORDATORIO_PACIENTE', { 
          nombre: turno.medico.nombre 
        }),
      ),
    ];
  }
}
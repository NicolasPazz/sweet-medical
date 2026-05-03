import { EstadoTurno } from "../turno/EstadoTurno.js";
import { Notificacion } from "./Notificacion.js";
import { Usuario } from "../usuarios/Usuario.js";
import { logger } from "../../utils/logger.js";
import { tNegocio } from "../../utils/i18n/i18n.js";

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
        tNegocio('RECORDATORIO_MEDICO', { 
          nombre: turno.paciente.nombre 
        })
      ),
      new Notificacion(
        turno.paciente.usuario,
        remitente,
        tNegocio('RECORDATORIO_PACIENTE', { 
          nombre: turno.medico.nombre 
        })
      ),
    ];
  }
}
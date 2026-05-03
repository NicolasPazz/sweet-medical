import { logger } from "../../utils/logger.js";
import { Notificacion } from "../Notificacion.js";
import { Usuario } from "../usuarios/Usuario.js";
import { Turno } from "../../turno/Turno.js";
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

export class Cancelado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  notificar(remitente) {
    const actor = this.turno.obtenerUltimoActor();
    const servicio = this.turno.obtenerNombreServicio();
    
    // Verificamos si quien canceló fue el paciente
    const esCanceladoPorPaciente = actor && actor.id === this.turno.paciente.usuario.id;

    if (esCanceladoPorPaciente) {
      logger.debug(
        tLog('LOG_CANCELACION_PACIENTE', { 
          id: this.turno.id, 
          nombre: this.turno.paciente.nombre, 
          servicio 
        })
      );

      return new Notificacion(
        this.turno.medico.usuario,
        remitente,
        tNegocio('CANCELACION_A_MEDICO', { 
          nombre: this.turno.paciente.nombre, 
          servicio 
        })
      );

    } else {
      logger.debug(
        tLog('LOG_CANCELACION_PROFESIONAL', { 
          id: this.turno.id, 
          nombre: this.turno.medico.nombre, 
          servicio 
        })
      );

      return new Notificacion(
        this.turno.paciente.usuario,
        remitente,
        tNegocio('CANCELACION_A_PACIENTE', { 
          fecha: this.turno.fechaHora.toLocaleDateString(), 
          sede: this.turno.sede.nombre, 
          servicio 
        })
      );
    }
  }
}
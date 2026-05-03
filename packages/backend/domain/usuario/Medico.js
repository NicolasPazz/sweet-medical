import { logger } from "../../utils/logger.js";
import { Agenda } from "../agenda/Agenda.js";
import { GeneradorDisponibilidad } from "../agenda/GeneradorDisponibilidad.js";
import { tLog } from "../../utils/i18n/i18n.js";

export class Medico {
  id;
  usuario;
  matricula;
  nombre;
  especialidades;
  practicas;
  sedes;
  disponibilidades;
  turnosActualesYFuturos;

  constructor(usuario, matricula, nombre) {
    this.usuario = usuario;
    this.matricula = matricula;
    this.nombre = nombre;
    this.especialidades = [];
    this.practicas = [];
    this.sedes = [];
    this.disponibilidades = [];
    this.turnosActualesYFuturos = [];
  }

  definirDisponibilidad(disponibilidad) {
    GeneradorDisponibilidad.actualizarDisponibilidad(disponibilidad, this.disponibilidades);
    
    logger.debug(
      tLog('LOG_DISPONIBILIDAD_DEFINIDA', {
        nombre: this.nombre,
        dia: disponibilidad.dia,
        inicio: disponibilidad.horaInicio,
        fin: disponibilidad.horaFin
      })
    );
  }

  refrescarTurnos() {
    logger.debug(
      tLog('LOG_REFRESCANDO_TURNOS', { 
        medico: this.nombre 
      })
    );
    this.turnosActualesYFuturos = Agenda.refrescarTurnosSegunDisponibilidadDe(this);
  }
}
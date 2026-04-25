import { logger } from "../../utils/logger.js";
import { GeneradorDisponibilidad } from "../agenda/GeneradorDisponibilidad.js";

export class Medico {
  constructor(id, usuario, matricula, nombre) {
    this.id = id;
    this.usuario = usuario;
    this.matricula = matricula;
    this.nombre = nombre;
    this.especialidades = [];
    this.practicas = [];
    this.sedes = [];
    this.disponibilidades = [];
  }

  definirDisponibilidad(disponibilidad) {
    GeneradorDisponibilidad.actualizarDisponibilidad(disponibilidad, this.disponibilidades);
    logger.debug(`Disponibilidad definida para el médico ${this.nombre} el día 
      ${disponibilidad.dia} de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`);
  }
}

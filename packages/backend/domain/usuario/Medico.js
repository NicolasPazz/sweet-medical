import { logger } from "../../utils/logger.js";

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
    this.disponibilidades.push(disponibilidad);
    logger.debug(`Disponibilidad definida para el médico ${this.nombre} el día 
      ${disponibilidad.dia} de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`);
  }
}

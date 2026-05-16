import { logger } from '../../utils/logger.js';
import { Agenda } from '../agenda/Agenda.js';
import { GeneradorDisponibilidad } from '../agenda/GeneradorDisponibilidad.js';

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

  // Modificado: Mapeo limpio destructurado. Si no vienen listas (vuelven de BD), inicializa arrays vacíos.
  constructor({ id, usuario, matricula, nombre, especialidades = [], practicas = [], sedes = [], disponibilidades = [], turnosActualesYFuturos = [] }) {
    this.id = id;
    this.usuario = usuario;
    this.matricula = matricula;
    this.nombre = nombre;
    this.especialidades = especialidades;
    this.practicas = practicas;
    this.sedes = sedes;
    this.disponibilidades = disponibilidades;
    this.turnosActualesYFuturos = turnosActualesYFuturos;
  }

  definirDisponibilidad(disponibilidad) {
    GeneradorDisponibilidad.actualizarDisponibilidad(disponibilidad, this.disponibilidades);
    logger.debug(`Disponibilidad definida para el médico ${this.nombre} el día ${disponibilidad.dia} de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`);
  }

  refrescarTurnos() {
    this.turnosActualesYFuturos = Agenda.refrescarTurnosSegunDisponibilidadDe(this);
  }
}
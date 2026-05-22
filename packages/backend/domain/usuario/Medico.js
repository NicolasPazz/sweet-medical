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

  constructor(usuario, matricula, nombre) {
    /*if (usuario && typeof usuario === 'object' && !usuario.constructor.name.includes('ObjectId')) {
      Object.assign(this, usuario);
      this.id = this.id || this._id;
      return;
    }*/

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
      `Disponibilidad definida para el médico ${this.nombre} el día ${disponibilidad.dia} de ${disponibilidad.horaInicio} a ${disponibilidad.horaFin}`,
    );
  }

  refrescarTurnos() {
    this.turnosActualesYFuturos = Agenda.refrescarTurnosSegunDisponibilidadDe(this);
  }
}

import { logger } from "../../utils/logger.js";
import { Turno } from "../backend/domain/turno/Turno.js";
import { crearFechaDesdeAtributos, horaAMinutos, estaEnDisponibilidad, obtenerDisponibilidadesLibres} from '../utils/functions.js';
import { Disponible } from './notificacion/estado-turno/Reservado.js';

export class Agenda {
  generarTurno(servicio, medico, disponibilidadesLibres) {
    
    logger.debug(`Generando turnos para especialidad ${servicio.nombre} y médico ${medico}`);

    const turnos = [];

    const offset = servicio.duracionTurnoEnMins;

    for(const disponibilidad of disponibilidadesLibres){

      let actualMinutos = horaAMinutos(disponibilidad.horaDesde);
      const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);

      while(actualMinutos + offset <= tiempoLimite){

      const fechaHora = crearFechaDesdeAtributos(disponibilidad.diaSemana, actualMinutos);

      const turno = new Turno(medico, null, fechaHora, null, servicio, servicio.costo);

      turnos.push(turno);

      actualMinutos += offset;
      }
    
    }

    return turnos;
  }

  //Genera todos los turnos segun la disponibilidad actual de un medico
  refrescarTurnosSegunDisponibilidadDe(medico) {
    // TODO
    logger.debug(`Refrescando turnos para médico ${medico}`);

    this.eliminarTurnosDesactualizados(medico);
    
    const disponibilidadesLibres = obtenerDisponibilidadesLibres(medico.disponibilidades, medico.turnosActualesYFuturos.filter(t => t.estado instanceof Disponible));

    const turnos = [];

    for(const especialidad of medico.especialidades){

      turnos.push(...this.generarTurno(especialidad, medico, disponibilidadesLibres));

    }

    for(const practica of medico.practicas){

      turnos.push(...this.generarTurno(practica, medico, disponibilidadesLibres));

    }

    medico.turnosActualesYFuturos.push(...turnos);

    return turnos; // Retorna un array de Turno[]
  }

  eliminarTurnosDesactualizados(medico) {
  const lista = medico.turnosActualesYFuturos;

  for (let i = lista.length - 1; i >= 0; i--) {
    const turno = lista[i];

    if (turno.estado instanceof Disponible) {
      
      const estaEnRango = medico.disponibilidades.some(disp => 
        estaEnDisponibilidad(turno.fechaHora, disp)
      );

      if (!estaEnRango) {
        lista.splice(i, 1);
      }
    }
  }
}

}

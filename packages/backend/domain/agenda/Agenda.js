import { logger } from '../../utils/logger.js';
import { Turno } from '../turno/Turno.js';
import {
  horaAMinutos,
  estaEnDisponibilidad,
  obtenerDisponibilidadesLibres,
  calcularHoraDesdeMinutos,
  horarioIncluido,
} from '../../utils/functions.js';
import { Disponible } from '../notificacion/estado-turno/Disponible.js';
import { Cancelado } from '../notificacion/estado-turno/Cancelado.js';
import { Usuario } from '../usuario/Usuario.js';

export class Agenda {
  generarTurno(admin, servicio, medico, disponibilidadesLibres) {
    logger.debug(`Generando turnos para especialidad ${servicio.nombre} y médico ${medico.nombre}`);

    const turnos = [];

    const offset = servicio.duracionTurnoEnMins;

    for (const disponibilidad of disponibilidadesLibres) {
      let actualMinutos = horaAMinutos(disponibilidad.horaDesde);
      const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);

      logger.debug('actualMinutos: ' + actualMinutos);
      logger.debug('offset: ' + offset);
      logger.debug('tiempoLimite: ' + tiempoLimite);

      const sedeDelMedico = medico.sedes && medico.sedes.length > 0 ? medico.sedes[0] : null;

      while (actualMinutos + offset <= tiempoLimite) {
        const turno = new Turno({
          medico,
          paciente: null,
          diaSemana: disponibilidad.diaSemana,
          hora: calcularHoraDesdeMinutos(actualMinutos),
          sede: sedeDelMedico,
          servicio,
          costo: servicio.costo,
          admin: admin,
        });

        turno.fechaHora = Agenda.configurarFechaCercana(
          disponibilidad.diaSemana,
          calcularHoraDesdeMinutos(actualMinutos),
        );

        logger.debug('Turno generado:', turno);

        turnos.push(turno);

        actualMinutos += offset;
      }
    }

    return turnos;
  }

  //Genera todos los turnos segun la disponibilidad actual de un medico
  refrescarTurnosSegunDisponibilidadDe(admin, medico) {
    // POR HACER
    logger.debug(`Refrescando turnos para médico ${medico.nombre}`);

    const turnosEliminados = this.eliminarTurnosDesactualizados(medico);

    const disponibilidadesLibres = obtenerDisponibilidadesLibres(
      medico.disponibilidades,
      medico.turnosActualesYFuturos.filter((t) => t.estado instanceof Disponible),
    );

    const turnos = [];

    logger.debug('DISPONIBILIDADES LIBRES para el medico de id: ' + medico._id || medico.id);
    logger.debug(disponibilidadesLibres);

    for (const especialidad of medico.especialidades) {
      turnos.push(...this.generarTurno(admin, especialidad, medico, disponibilidadesLibres));
    }

    for (const practica of medico.practicas) {
      turnos.push(...this.generarTurno(admin, practica, medico, disponibilidadesLibres));
    }

    medico.turnosActualesYFuturos.push(...turnos);

    return turnosEliminados;
  }

  eliminarTurnosDesactualizados(medico) {
    const lista = medico.turnosActualesYFuturos;

    const turnosEliminados = [];

    for (let i = lista.length - 1; i >= 0; i--) {
      const turno = lista[i];

      if (turno.estado instanceof Disponible) {
        const estaEnRango = medico.disponibilidades.some((disp) =>
          estaEnDisponibilidad(turno.diaSemana, turno.hora, disp),
        );

        if (!estaEnRango) {
          turno.actualizarEstado(
            new Cancelado(turno),
            Usuario.USUARIO_SISTEMA,
            'Dejo de cumplir con la disponibilidad del medico',
          );
          turnosEliminados.push(turno);
          lista.splice(i, 1);
        }
      }
    }
    return turnosEliminados;
  }

  static generarFechaHora(turnosReservados, turnoActual) {
    let fechaCandidata = this.configurarFechaCercana(turnoActual.diaSemana, turnoActual.hora);

    const reservadosMismoDia = turnosReservados.filter(
      (t) => t.diaSemana === turnoActual.diaSemana,
    );

    let hayConflicto = true;

    while (hayConflicto) {
      // Clonamos el turno para la comparación (sin afectar el original todavía)
      const intentoTurno = { ...turnoActual, fechaHora: fechaCandidata };

      // 2. Buscamos si existe algún solapamiento en ESTA fecha específica
      const conflicto = reservadosMismoDia.find(
        (t) =>
          t.fechaHora.getTime() === fechaCandidata.getTime() || // Misma fecha exacta
          (t.diaSemana === intentoTurno.diaSemana && horarioIncluido(t, intentoTurno)),
      );

      if (conflicto) {
        // 3. Si hay conflicto, saltamos 7 días y volvemos a checkear
        fechaCandidata.setDate(fechaCandidata.getDate() + 7);
      } else {
        // 4. Si no hay conflicto, salimos del bucle
        hayConflicto = false;
      }
    }

    return fechaCandidata;
  }

  /**
   * Genera la fecha y hora más cercana hacia el futuro para un turno,
   * basándose en el día de la semana y la hora de inicio.
   */
  static configurarFechaCercana(diaSemanaDeseado, horaInicioStr, referencia = new Date()) {
    // 1. Validación de entrada (Fundamental para el Médico 17)
    if (!diaSemanaDeseado || !horaInicioStr) {
      logger.error(`[ERROR] Datos incompletos: Dia=${diaSemanaDeseado}, Hora=${horaInicioStr}`);
      return new Date(); // Retornamos hoy para evitar el undefined.getTime()
    }

    const hoy = new Date(referencia.getTime());
    const dias = {
      DOMINGO: 0,
      LUNES: 1,
      MARTES: 2,
      MIERCOLES: 3,
      JUEVES: 4,
      VIERNES: 5,
      SABADO: 6,
    };

    const objetivo = dias[diaSemanaDeseado.toUpperCase()];
    const diaActual = hoy.getDay();

    // 2. Si el día no existe en el mapa, evitamos el NaN
    if (objetivo === undefined) return hoy;

    const [horas, minutos] = horaInicioStr.split(':').map(Number);
    const ahoraHoras = hoy.getHours();
    const ahoraMinutos = hoy.getMinutes();

    let diferencia = (objetivo - diaActual + 7) % 7;
    if (diferencia === 0) {
      if (horas < ahoraHoras || (horas === ahoraHoras && minutos <= ahoraMinutos)) {
        diferencia = 7;
      }
    }

    // 3. Crear el nuevo objeto sin mutar el original
    const resultado = new Date(hoy.getTime());
    resultado.setDate(hoy.getDate() + diferencia);
    resultado.setHours(horas, minutos, 0, 0);

    return resultado;
  }
}

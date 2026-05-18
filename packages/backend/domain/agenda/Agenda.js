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
  static generarTurno(servicio, medico, disponibilidadesLibres, usuarioSistema) {
    logger.debug(`Generando turnos para especialidad ${servicio.nombre} y médico ${medico.nombre}`);

    const turnos = [];
    const offset = servicio.duracionTurnoEnMins;

    for (const disponibilidad of disponibilidadesLibres) {
      let actualMinutos = horaAMinutos(disponibilidad.horaDesde);
      const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);

      while (actualMinutos + offset <= tiempoLimite) {
        const turno = new Turno(
          medico,
          null,
          disponibilidad.diaSemana,
          calcularHoraDesdeMinutos(actualMinutos),
          null,
          servicio,
          servicio.costo,
          usuarioSistema,
        );

        turnos.push(turno);

        actualMinutos += offset;
      }
    }

    return turnos;
  }

  static refrescarTurnosSegunDisponibilidadDe(medico, usuarioSistema) {
    logger.debug(`Refrescando turnos para médico ${medico.nombre}`);

    const turnosEliminados = this.eliminarTurnosDesactualizados(medico, usuarioSistema);

    const disponibilidadesLibres = obtenerDisponibilidadesLibres(
      medico.disponibilidades,
      medico.turnosActualesYFuturos,
    );

    const turnosNuevos = [];

    for (const especialidad of medico.especialidades) {
      turnosNuevos.push(
        ...this.generarTurno(especialidad, medico, disponibilidadesLibres, usuarioSistema),
      );
    }

    for (const practica of medico.practicas) {
      turnosNuevos.push(
        ...this.generarTurno(practica, medico, disponibilidadesLibres, usuarioSistema),
      );
    }

    medico.turnosActualesYFuturos.push(...turnosNuevos);
    return { turnosEliminados, turnosNuevos };
  }

  static eliminarTurnosDesactualizados(medico, usuarioSistema) {
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
            usuarioSistema,
            new Cancelado(turno),
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
  static configurarFechaCercana(diaSemanaDeseado, horaInicioStr) {
    // 1. Validación de entrada (Fundamental para el Médico 17)
    if (!diaSemanaDeseado || !horaInicioStr) {
      console.error(`[ERROR] Datos incompletos: Dia=${diaSemanaDeseado}, Hora=${horaInicioStr}`);
      return new Date(); // Retornamos hoy para evitar el undefined.getTime()
    }

    const hoy = new Date();
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

    let diferencia = objetivo - diaActual;
    if (diferencia <= 0) {
      diferencia += 7;
    }

    // 3. Crear el nuevo objeto sin mutar el original
    const resultado = new Date(hoy.getTime());
    resultado.setDate(hoy.getDate() + diferencia);

    const [horas, minutos] = horaInicioStr.split(':').map(Number);
    resultado.setHours(horas, minutos, 0, 0);

    return resultado;
  }
}

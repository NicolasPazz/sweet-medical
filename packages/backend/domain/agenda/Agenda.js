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

  static eliminarSlotsDesactualizados(medico, slotsDisponibles) {
  const slotsEliminados = [];

  for (let i = slotsDisponibles.length - 1; i >= 0; i--) {
    const slot = slotsDisponibles[i];

    const sigueSiendoValido = medico.disponibilidades.some((disp) =>
      estaEnDisponibilidad(slot.diaSemana, slot.horaInicio, disp)
    );

    if (!sigueSiendoValido) {
      slotsEliminados.push(slot);
    }
  }
  return slotsEliminados;
}

  static generarSlotsNuevos(medico, slotsTotales, duracionSlot, semanasMaxGeneracionSlots) {

  const slotsNuevos = [];
  const offset = duracionSlot;

  const slotsOcupados = slotsTotales.filter(s => s.estado !== 'DISPONIBLE');
  const slotsDisponibles = slotsTotales.filter(s => s.estado === 'DISPONIBLE');

  for (const disponibilidad of medico.disponibilidades) {
    const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);
    const diaDeseadoNumero = Agenda.parsearDiaSemanaANumero(disponibilidad.diaSemana);

    const diasHastaPrimerDia = Agenda.fechaMasCercanaConDiaSemana(diaDeseadoNumero, new Date(), 0);

    for (let i = 0; i < semanasMaxGeneracionSlots; i++) {
      let actualMinutos = horaAMinutos(disponibilidad.horaDesde);

      const fechaSlot = new Date();
      fechaSlot.setDate(fechaSlot.getDate() + diasHastaPrimerDia + (7 * i));
      const fechaSlotStr = fechaSlot.toISOString().split('T')[0];

      while (actualMinutos + offset <= tiempoLimite) {
        const horaInicioStr = calcularHoraDesdeMinutos(actualMinutos);

        const yaEstaReservado = slotsOcupados.some(s => 
          s.fecha === fechaSlotStr && s.horaInicio === horaInicioStr
        );

        if (yaEstaReservado) {
          actualMinutos += offset;
          continue;
        }

        const yaExistePrecalculado = slotsDisponibles.some(s =>
          s.fecha === fechaSlotStr && s.horaInicio === horaInicioStr
        );

        if (yaExistePrecalculado) {
          actualMinutos += offset;
          continue;
        }

        const slot = new Slot(
          medico,
          fechaSlotStr,
          horaInicioStr,
          duracionSlot,
        );

        slotsNuevos.push(slot);
        actualMinutos += offset;
      }
    }
  }
  return slotsNuevos;
}

  static refrescarSlots(medico, slotsTotales, duracionSlot, semanasMaxGeneracionSlots) {

    const slotsDisponibles = slotsTotales.filter(s => s.estado === 'DISPONIBLE');

    const slotsEliminados = this.eliminarSlotsDesactualizados(medico, slotsDisponibles);
    
    const slotsNuevos = this.generarSlotsNuevos(medico, slotsTotales, duracionSlot, semanasMaxGeneracionSlots);
    
    return { slotsEliminados, slotsNuevos };
  }

  static parsearDiaSemanaANumero(diaSemana) {
  switch(diaSemana.toUpperCase()){
    case 'DOMINGO': return 0;
    case 'LUNES': return 1;
    case 'MARTES': return 2;
    case 'MIERCOLES': return 3;
    case 'JUEVES': return 4;
    case 'VIERNES': return 5;
    case 'SABADO': return 6;
    default: throw new Error(`Día de la semana inválido: ${diaSemana}`);
  }
}

  static fechaMasCercanaConDiaSemana(diaSemanaDeseado, fechaBase, diasASumar) {
  const fechaTentativa = new Date(fechaBase);
  fechaTentativa.setDate(fechaTentativa.getDate() + diasASumar);

  if (fechaTentativa.getDay() === diaSemanaDeseado) {
    return diasASumar;  
  } else {
    return Agenda.fechaMasCercanaConDiaSemana(diaSemanaDeseado, fechaBase, diasASumar + 1);
  }
}

  static sumarDias(fechaBase, diasASumar, diasNoLaborales) {
  const copiaFecha = new Date(fechaBase);
  
  const diasFinales = Agenda.saltarDiasNoLaborales(fechaBase, diasASumar, diasNoLaborales);

  copiaFecha.setDate(copiaFecha.getDate() + diasFinales);
  
  const offset = copiaFecha.getTimezoneOffset() * 60000;
  const fechaLocal = new Date(copiaFecha.getTime() - offset);

  return { fechaSlot: fechaLocal.toISOString().split('T')[0] , diasTotales: diasFinales };
}

  static saltarDiasNoLaborales(fechaBase, diasASumar, diasNoLaborales) {

    const fechaDestinoTentativa = new Date(fechaBase);

    fechaDestinoTentativa.setDate(fechaDestinoTentativa.getDate() + diasASumar);
    
    if(diasNoLaborales.includes(fechaDestinoTentativa.getDay())){
    diasASumar += 1;
    
    return this.saltarDiasNoLaborales(fechaBase, diasASumar, diasNoLaborales);
  }

  return diasASumar;
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
      const intentoTurno = { ...turnoActual, fechaHora: fechaCandidata };

      const conflicto = reservadosMismoDia.find(
        (t) =>
          t.fechaHora.getTime() === fechaCandidata.getTime() ||
          (t.diaSemana === intentoTurno.diaSemana && horarioIncluido(t, intentoTurno)),
      );

      if (conflicto) {
        fechaCandidata.setDate(fechaCandidata.getDate() + 7);
      } else {
        hayConflicto = false;
      }
    }

    return fechaCandidata;
  }

  
  static configurarFechaCercana(diaSemanaDeseado, horaInicioStr) {
    if (!diaSemanaDeseado || !horaInicioStr) {
      console.error(`[ERROR] Datos incompletos: Dia=${diaSemanaDeseado}, Hora=${horaInicioStr}`);
      return new Date();
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

    if (objetivo === undefined) return hoy;

    let diferencia = objetivo - diaActual;
    if (diferencia <= 0) {
      diferencia += 7;
    }

    const resultado = new Date(hoy.getTime());
    resultado.setDate(hoy.getDate() + diferencia);

    const [horas, minutos] = horaInicioStr.split(':').map(Number);
    resultado.setHours(horas, minutos, 0, 0);

    return resultado;
  }

  static obtenerSlotsContiguosParaDuracion(slots, duracionTurnoEnMins) {
    
    let tiempoTotal = 0;

    const slotsOcupados = [];

    for(const slot of slots) {

      let duracionMins = slot.duracionMins;

      tiempoTotal += duracionMins;

      if(tiempoTotal > duracionTurnoEnMins) {
        break;
      }

      slotsOcupados.push(slot);
    }

    return slotsOcupados;
  }
}
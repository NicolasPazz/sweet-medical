import { logger } from '../../utils/logger.js';
import { Turno } from '../turno/Turno.js';
import {
  horaAMinutos,
  estaEnDisponibilidad,
  obtenerDisponibilidadesLibres,
  calcularHoraDesdeMinutos,
  horarioIncluido,
  ordenarSlots,
  validarSlotsContiguos,
} from '../../utils/functions.js';
import { Cancelado } from '../notificacion/estado-turno/Cancelado.js';
import { Slot } from '../turno/Slot.js';
import { EstadoTurno } from '../turno/EstadoTurno.js';
/**
 * Convierte un objeto Date a string 'YYYY-MM-DD' usando sus componentes UTC.
 * Todo el sistema de agenda (disponibilidad, slots, turnos) opera en UTC, así
 * que las fechas de calendario se derivan siempre de los componentes UTC del
 * Date, nunca de los componentes locales del servidor (que podrían no ser UTC
 * según dónde esté desplegado).
 */
function fechaUTCAString(date) {
  const anio = date.getUTCFullYear();
  const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dia = String(date.getUTCDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

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
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    const slotsEliminados = [];
    const ahora = new Date();

    for (let i = slotsDisponibles.length - 1; i >= 0; i--) {
      const slot = slotsDisponibles[i];

      // 1. Chequeo de fecha real: si el slot ya pasó (fecha+hora anterior a "ahora"),
      // se elimina sin importar si sigue matcheando la disponibilidad semanal vigente.
      // Esto es lo que evita que un slot de un viernes ya pasado quede DISPONIBLE
      // para siempre solo porque el médico sigue atendiendo los viernes.
      const fechaHoraSlot = Agenda.combinarFechaYHora(slot.fecha, slot.horaInicio);
      if (fechaHoraSlot < ahora) {
        slotsEliminados.push(slot);
        continue;
      }

      // 2. Chequeo de disponibilidad vigente: si el médico cambió su disponibilidad
      // y este slot (futuro) ya no cae dentro de ningún rango, también se elimina.
      // Los slots ya no tienen diaSemana — se deriva desde la fecha (UTC)
      const [anio, mes, dia] = slot.fecha.split('-').map(Number);
      const diaSemanaSlot = diasSemana[new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()];

      const sigueSiendoValido = medico.disponibilidades.some((disp) =>
        estaEnDisponibilidad(diaSemanaSlot, slot.horaInicio, disp),
      );

      if (!sigueSiendoValido) {
        slotsEliminados.push(slot);
      }
    }
    return slotsEliminados;
  }

  /**
   * Combina un string de fecha 'YYYY-MM-DD' y hora 'HH:MM' (ambos en UTC,
   * igual que se persiste toda la agenda) en un único objeto Date, para poder
   * compararlo contra `new Date()`. Usa `Date.UTC(...)` en vez de componentes
   * locales para que el resultado no dependa del huso horario en el que corra
   * el proceso de Node (server-local != UTC en muchos entornos de despliegue).
   */
  static combinarFechaYHora(fechaStr, horaStr) {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    const [horas, minutos] = horaStr.split(':').map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia, horas, minutos, 0, 0));
  }

  static generarSlotsNuevos(medico, slotsTotales, duracionSlot, semanasMaxGeneracionSlots) {
    const slotsNuevos = [];
    const offset = duracionSlot;
    const MS_POR_DIA = 24 * 60 * 60 * 1000;
    const slotsOcupados = slotsTotales.filter((s) => s.estado !== 'DISPONIBLE');
    const slotsDisponibles = slotsTotales.filter((s) => s.estado === 'DISPONIBLE');

    for (const disponibilidad of medico.disponibilidades) {
      const tiempoLimite = horaAMinutos(disponibilidad.horaHasta);
      const diaDeseadoNumero = Agenda.parsearDiaSemanaANumero(disponibilidad.diaSemana);

      const ahora = new Date();

      // Se pasa horaDesde para que, si hoy (en UTC) coincide con el día de
      // disponibilidad, se valide que el horario de inicio aún no haya pasado.
      const diasHastaPrimerDia = Agenda.fechaMasCercanaConDiaSemana(
        diaDeseadoNumero,
        ahora,
        0,
        disponibilidad.horaDesde,
      );

      for (let i = 0; i < semanasMaxGeneracionSlots; i++) {
        let actualMinutos = horaAMinutos(disponibilidad.horaDesde);

        // Aritmética de días en milisegundos UTC (sin DST, sin depender del
        // huso horario del servidor) en vez de setDate()/getDate() locales.
        const fechaSlot = new Date(ahora.getTime() + (diasHastaPrimerDia + 7 * i) * MS_POR_DIA);
        const fechaSlotStr = fechaUTCAString(fechaSlot);

        while (actualMinutos + offset <= tiempoLimite) {
          const horaInicioStr = calcularHoraDesdeMinutos(actualMinutos);

          const yaEstaReservado = slotsOcupados.some(
            (s) => s.fecha === fechaSlotStr && s.horaInicio === horaInicioStr,
          );

          if (yaEstaReservado) {
            actualMinutos += offset;
            continue;
          }

          const yaExistePrecalculado = slotsDisponibles.some(
            (s) => s.fecha === fechaSlotStr && s.horaInicio === horaInicioStr,
          );

          if (yaExistePrecalculado) {
            actualMinutos += offset;
            continue;
          }

          const slot = new Slot(medico, fechaSlotStr, horaInicioStr, duracionSlot);

          slotsNuevos.push(slot);
          actualMinutos += offset;
        }
      }
    }
    return slotsNuevos;
  }

  static refrescarSlots(medico, slotsTotales, duracionSlot, semanasMaxGeneracionSlots) {
    const slotsDisponibles = slotsTotales.filter((s) => s.estado === 'DISPONIBLE');

    const slotsEliminados = this.eliminarSlotsDesactualizados(medico, slotsDisponibles);

    slotsEliminados.forEach((slot) =>
      logger.debug(`Slot eliminado: ${slot.fecha} ${slot.horaInicio}`),
    );

    const slotsNuevos = this.generarSlotsNuevos(
      medico,
      slotsTotales,
      duracionSlot,
      semanasMaxGeneracionSlots,
    );

    return { slotsEliminados, slotsNuevos };
  }

  static parsearDiaSemanaANumero(diaSemana) {
    switch (diaSemana.toUpperCase()) {
      case 'DOMINGO':
        return 0;
      case 'LUNES':
        return 1;
      case 'MARTES':
        return 2;
      case 'MIERCOLES':
        return 3;
      case 'JUEVES':
        return 4;
      case 'VIERNES':
        return 5;
      case 'SABADO':
        return 6;
      default:
        throw new Error(`Día de la semana inválido: ${diaSemana}`);
    }
  }

  /**
   * Devuelve cuántos días hay que sumar a fechaBase para llegar al próximo
   * día de la semana deseado que sea válido para generar slots.
   *
   * Todas las comparaciones son en UTC (día de semana, "es hoy", hora actual),
   * porque la disponibilidad del médico se persiste en UTC. Usar getDay()/
   * getHours() locales acá haría depender el resultado del huso horario en el
   * que corra el proceso de Node.
   *
   * Cuando la fecha candidata resulta ser HOY (mismo año/mes/día UTC que fechaBase),
   * verifica que la hora actual UTC sea estrictamente menor que horaDesdeStr.
   * Si ya pasó ese horario, descarta hoy y busca la siguiente semana.
   *
   * @param {number} diaSemanaDeseado  - Número 0-6 (domingo=0)
   * @param {Date}   fechaBase         - Fecha desde la cual buscar (normalmente new Date())
   * @param {number} diasASumar        - Acumulador recursivo, iniciar en 0
   * @param {string} horaDesdeStr      - Horario de inicio de la disponibilidad ('HH:MM', UTC)
   */
  static fechaMasCercanaConDiaSemana(diaSemanaDeseado, fechaBase, diasASumar = 0, horaDesdeStr) {
    const MS_POR_DIA = 24 * 60 * 60 * 1000;
    const fechaTentativa = new Date(fechaBase.getTime() + diasASumar * MS_POR_DIA);

    if (fechaTentativa.getUTCDay() === diaSemanaDeseado) {
      // Comprueba si la fecha tentativa es el mismo día UTC que fechaBase
      const esHoy =
        fechaTentativa.getUTCFullYear() === fechaBase.getUTCFullYear() &&
        fechaTentativa.getUTCMonth() === fechaBase.getUTCMonth() &&
        fechaTentativa.getUTCDate() === fechaBase.getUTCDate();

      if (esHoy && horaDesdeStr) {
        const ahoraEnMinutos = fechaBase.getUTCHours() * 60 + fechaBase.getUTCMinutes();
        const horaInicioEnMinutos = horaAMinutos(horaDesdeStr);

        // Si la hora actual ya superó el inicio de la disponibilidad,
        // este día no sirve: saltamos a la siguiente semana.
        if (ahoraEnMinutos >= horaInicioEnMinutos) {
          return Agenda.fechaMasCercanaConDiaSemana(
            diaSemanaDeseado,
            fechaBase,
            diasASumar + 1,
            horaDesdeStr,
          );
        }
      }

      return diasASumar;
    }

    return Agenda.fechaMasCercanaConDiaSemana(
      diaSemanaDeseado,
      fechaBase,
      diasASumar + 1,
      horaDesdeStr,
    );
  }

  static sumarDias(fechaBase, diasASumar, diasNoLaborales) {
    const copiaFecha = new Date(fechaBase);

    const diasFinales = Agenda.saltarDiasNoLaborales(fechaBase, diasASumar, diasNoLaborales);

    copiaFecha.setDate(copiaFecha.getDate() + diasFinales);

    return { fechaSlot: fechaUTCAString(copiaFecha), diasTotales: diasFinales };
  }

  static saltarDiasNoLaborales(fechaBase, diasASumar, diasNoLaborales) {
    const fechaDestinoTentativa = new Date(fechaBase);

    fechaDestinoTentativa.setDate(fechaDestinoTentativa.getDate() + diasASumar);

    if (diasNoLaborales.includes(fechaDestinoTentativa.getDay())) {
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

      if (turno.estado.getEstadoNombre() === EstadoTurno.DISPONIBLE) {
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
      logger.error(`[ERROR] Datos incompletos: Dia=${diaSemanaDeseado}, Hora=${horaInicioStr}`);
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

    for (const slot of slots) {
      if (tiempoTotal >= duracionTurnoEnMins) {
        break;
      }

      tiempoTotal += slot.duracionMins;

      slotsOcupados.push(slot);
    }

    return slotsOcupados;
  }

  /**
   * Agrupa una lista de slots en sublistas, una por cada fecha distinta,
   * ordenadas cronológicamente.
   * @param {Slot[]} slots
   * @returns {Slot[][]}
   */
  static agruparSlotsPorFecha(slots) {
    const mapa = new Map();

    for (const slot of slots) {
      const fecha = slot.fecha;
      if (!mapa.has(fecha)) {
        mapa.set(fecha, []);
      }
      mapa.get(fecha).push(slot);
    }

    return Array.from(mapa.entries())
      .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
      .map(([, slotsDelDia]) => slotsDelDia);
  }

  /**
   * Parsea un string de hora (HH:mm) y lo aplica al día actual o a una fecha base.
   * @param {string} horaString - El string con la hora (ej: "8:00", "14:30").
   * @param {Date} [fechaBase=new Date()] - Opcional. La fecha sobre la cual aplicar la hora. Por defecto es hoy.
   * @returns {Date} El objeto Date modificado con la hora especificada.
   */
  parsearHoraADate(horaString, fechaBase = new Date()) {
    // 1. Separar el string en componentes de hora y minuto usando split
    const [horas, minutos] = horaString.split(':').map(Number);

    // Validar que el formato sea correcto y los números sean válidos
    if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
      throw new Error('Formato de hora inválido. Debe ser HH:mm entre 00:00 y 23:59');
    }

    // 2. Clonar la fecha base para no mutar el objeto original si se pasa por parámetro
    const nuevaFecha = new Date(fechaBase.getTime());

    // 3. Establecer horas, minutos, y limpiar segundos/milisegundos para una comparación limpia
    nuevaFecha.setHours(horas, minutos, 0, 0);

    return nuevaFecha;
  }

  static generarTurnosSegunMedicoYServicio(medico, slots, servicio) {
    const turnosGenerados = [];

    const slotsDisponibles = slots.filter((s) => {
      const estadoStr =
        typeof s.estado?.getItemsNombre === 'function' ? s.estado.getItemsNombre() : s.estado;
      return String(estadoStr).toUpperCase() === 'DISPONIBLE';
    });
    const slotsOrdenados = ordenarSlots(slotsDisponibles);
    const slotsPorFecha = Agenda.agruparSlotsPorFecha(slotsOrdenados);
    const duracionTurno = servicio.duracionTurnoEnMins;

    for (const slotsDelDia of slotsPorFecha) {
      let i = 0;

      while (i < slotsDelDia.length) {
        const slotInicio = slotsDelDia[i];

        // Un slot DISPONIBLE de hoy cuya hora de inicio ya pasó no debe ofrecerse
        // como turno reservable, aunque el cronjob de limpieza (3am) todavía no haya
        // corrido para borrarlo. Se compara fecha+hora real contra "ahora".
        const fechaHoraSlot = Agenda.combinarFechaYHora(slotInicio.fecha, slotInicio.horaInicio);
        if (fechaHoraSlot < new Date()) {
          i++;
          continue;
        }
        // 1. Validar Alineación de Grilla Fija
        const [horaStr, minStr] = slotInicio.horaInicio.split(':');
        const minutoInicio = parseInt(horaStr, 10) * 60 + parseInt(minStr, 10);

        if (minutoInicio % duracionTurno !== 0) {
          // No está alineado a la grilla
          i++;
          continue;
        }

        const slotsParaTurno = [slotInicio];
        let minutosAcumulados = slotInicio.duracionMins;

        // Extender con slots contiguos hasta cubrir la duración
        let j = i + 1;
        while (j < slotsDelDia.length && minutosAcumulados < duracionTurno) {
          const ultimoSlot = slotsParaTurno[slotsParaTurno.length - 1];
          if (!validarSlotsContiguos([ultimoSlot, slotsDelDia[j]])) break;

          slotsParaTurno.push(slotsDelDia[j]);
          minutosAcumulados += slotsDelDia[j].duracionMins;
          j++;
        }

        if (minutosAcumulados >= duracionTurno) {
          // Resolver Sede: Mongoose por defecto inicializa slotInicio.sede como { _id: null, nombre: null }.
          // Por ende, debemos comprobar que la sede sea válida (tenga id, _id o nombre) antes de usarla,
          // de lo contrario recurrimos a la sede configurada del médico.
          const sedeVirtual =
            slotInicio.sede && (slotInicio.sede._id || slotInicio.sede.id || slotInicio.sede.nombre)
              ? slotInicio.sede
              : medico.sedes && medico.sedes.length > 0
                ? medico.sedes[0]
                : null;

          // Turno válido: avanzar i hasta después del último slot usado
          const turno = new Turno(
            medico,
            null,
            `${slotsParaTurno[0].fecha}T${slotsParaTurno[0].horaInicio}:00Z`,
            slotsParaTurno[0].horaInicio,
            sedeVirtual,
            servicio,
            servicio.costo,
          );
          turno.slotsAsociados.push(...slotsParaTurno);
          turno.id = `virtual_${slotsParaTurno.map((s) => s.id || s._id).join('_')}`;
          turno.estado = 'DISPONIBLE';

          turnosGenerados.push(turno);
          i = j; // saltar al slot siguiente al último consumido
        } else {
          // No se pudo armar un turno desde este slot (hueco o fin de lista)
          i++;
        }
      }
    }

    return turnosGenerados;
  }
}

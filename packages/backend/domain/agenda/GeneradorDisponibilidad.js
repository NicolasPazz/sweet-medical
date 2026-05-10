import { DisponibilidadHoraria } from '../agenda/DisponibilidadHoraria.js';

export class GeneradorDisponibilidad {
  static actualizarDisponibilidad(nuevaDisponibilidad, disponibilidades) {
    // 1. Identificar TODOS los que colisionan con el nuevo bloque
    // Usamos una función que detecte colisiones incluso si el bloque se expande
    let colisionados = disponibilidades.filter(
      (d) =>
        d.diaSemana === nuevaDisponibilidad.diaSemana && this.hayColision(d, nuevaDisponibilidad),
    );

    // Si no hay colisiones, simplemente agregamos el nuevo y salimos
    if (colisionados.length === 0) {
      disponibilidades.push(nuevaDisponibilidad);
      return disponibilidades;
    }

    // 2. Fusionar todos los encontrados + el nuevo
    let todosParaFusionar = [...colisionados, nuevaDisponibilidad];

    // Normalizamos todos a una línea de tiempo de 0 a 48hs
    let mapeados = todosParaFusionar.map((d) => {
      let inicio = d.horaDesde;
      let fin = d.horaHasta < d.horaDesde ? d.horaHasta + 24 : d.horaHasta;

      // Si el bloque es puramente de madrugada (ej 0.5) y hay otros bloques nocturnos,
      // lo movemos a la sección de "después de medianoche" (24.5)
      if (inicio < 12 && todosParaFusionar.some((x) => x.horaHasta < x.horaDesde)) {
        inicio += 24;
        fin += 24;
      }
      return { inicio, fin };
    });

    let minInicio = Math.min(...mapeados.map((m) => m.inicio));
    let maxFin = Math.max(...mapeados.map((m) => m.fin));

    const bloqueFinal = {
      diaSemana: nuevaDisponibilidad.diaSemana,
      horaDesde: minInicio % 24,
      horaHasta: maxFin % 24,
    };

    // 3. Limpieza y Reemplazo
    const filtrados = disponibilidades.filter((d) => !colisionados.includes(d));
    disponibilidades.length = 0;
    disponibilidades.push(...filtrados, bloqueFinal);

    return disponibilidades;
  }

  /**
   * Comprueba si una hora específica está dentro de un rango,
   * manejando el cruce de medianoche.
   */
  static isTimeInRange(hora, inicio, fin) {
    if (inicio < fin) {
      // Rango normal: 08:00 a 10:00 (10:00 SÍ está adentro)
      return hora >= inicio && hora <= fin;
    } else {
      // Rango nocturno: 23:00 a 02:00 (02:00 SÍ está adentro)
      return hora >= inicio || hora <= fin;
    }
  }

  /**
   * Determina si dos rangos de horario colisionan.
   */
  static hayColision(rA, rB) {
    const inicioB_en_A = this.isTimeInRange(rB.horaDesde, rA.horaDesde, rA.horaHasta);
    const inicioA_en_B = this.isTimeInRange(rA.horaDesde, rB.horaDesde, rB.horaHasta);

    // Chequeo de fronteras adicionales (opcional pero seguro)
    const finB_en_A = this.isTimeInRange(rB.horaHasta, rA.horaDesde, rA.horaHasta);
    const finA_en_B = this.isTimeInRange(rA.horaHasta, rB.horaDesde, rB.horaHasta);

    return inicioB_en_A || inicioA_en_B || finB_en_A || finA_en_B;
  }

  static check(rangeA, rangeB) {
    return this.hayColision(rangeA, rangeB);
  }
}

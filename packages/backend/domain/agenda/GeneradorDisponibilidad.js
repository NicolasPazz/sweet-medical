export class GeneradorDisponibilidad {
  static actualizarDisponibilidad(nuevaDisponibilidad, disponibilidades) {
    let colisionados = disponibilidades.filter(
      (d) =>
        d.diaSemana === nuevaDisponibilidad.diaSemana && this.hayColision(d, nuevaDisponibilidad),
    );

    if (colisionados.length === 0) {
      disponibilidades.push(nuevaDisponibilidad);
      return disponibilidades;
    }

    let todosParaFusionar = [...colisionados, nuevaDisponibilidad];

    let mapeados = todosParaFusionar.map((d) => {
      let inicio = d.horaDesde;
      let fin = d.horaHasta < d.horaDesde ? d.horaHasta + 24 : d.horaHasta;

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

    const filtrados = disponibilidades.filter((d) => !colisionados.includes(d));
    disponibilidades.length = 0;
    disponibilidades.push(...filtrados, bloqueFinal);

    return disponibilidades;
  }

  static isTimeInRange(hora, inicio, fin) {
    if (inicio < fin) {
      return hora >= inicio && hora <= fin;
    } else {
      return hora >= inicio || hora <= fin;
    }
  }

  static hayColision(rA, rB) {
    const inicioB_en_A = this.isTimeInRange(rB.horaDesde, rA.horaDesde, rA.horaHasta);
    const inicioA_en_B = this.isTimeInRange(rA.horaDesde, rB.horaDesde, rB.horaHasta);

    const finB_en_A = this.isTimeInRange(rB.horaHasta, rA.horaDesde, rA.horaHasta);
    const finA_en_B = this.isTimeInRange(rA.horaHasta, rB.horaDesde, rB.horaHasta);

    return inicioB_en_A || inicioA_en_B || finB_en_A || finA_en_B;
  }

  static check(rangeA, rangeB) {
    return this.hayColision(rangeA, rangeB);
  }
}

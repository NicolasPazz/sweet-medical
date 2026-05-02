import { Plan } from './Plan.js';
import { NivelCobertura } from './NivelCobertura.js';

export class PlanPrepaga extends Plan {
  constructor(nombre) {
    super(nombre);
  }

  calcularCosto(prestacion, tipo) {
    let nivel = NivelCobertura.NO_CUBIERTA;

    if (tipo === 'especialidad') {
      nivel = this.obtenerCoberturaPorEspecialidad(prestacion) || NivelCobertura.NO_CUBIERTA;
    } else if (tipo === 'practica') {
      nivel = this.obtenerCoberturaPorPractica(prestacion) || NivelCobertura.NO_CUBIERTA;
    }

    let costoFinal = prestacion.costoBase || prestacion.costoConsulta || 0;

    switch (nivel) {
      case NivelCobertura.TOTAL:
        costoFinal = 0;
        break;
      case NivelCobertura.PARCIAL: {
        const copago = this.porcentajeCopago ?? parseFloat(process.env.DEFAULT_COPAGO || '0.5');
        costoFinal = costoFinal * copago;
        break;
      }
      case NivelCobertura.NO_CUBIERTA:
      default:
        break; // paga el 100%
    }

    return { nivel, costo: costoFinal };
  }
}

import { Plan } from './Plan.js';
import { NivelCobertura } from './NivelCobertura.js';

export class PlanParticular extends Plan {
  constructor() {
    super('Particular');
  }

  calcularCosto(prestacion, tipo) {
    // El particular nunca tiene cobertura
    const costoFinal = prestacion.costoBase || prestacion.costoConsulta || 0;
    
    return { 
      nivel: NivelCobertura.NO_CUBIERTA, 
      costo: costoFinal 
    };
  }
}

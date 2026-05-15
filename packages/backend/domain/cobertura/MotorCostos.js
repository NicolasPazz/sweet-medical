import { PlanParticular } from './PlanParticular.js';
import { NivelCobertura } from './NivelCobertura.js';
import { logger } from '../../utils/logger.js';

export class MotorCostos {
  /**
   * Calcula cobertura y monto final para un turno según el paciente
   * @param {Turno} turno
   * @param {Paciente} paciente (Puede ser null si aún no se asignó paciente en la búsqueda, asumiremos particular)
   * @returns {Object} { tipoCobertura: String, costoEstimado: Number }
   */
  calcularPara(turno, paciente) {
    let prestacion;
    let tipo;

    if (turno.practica) {
      prestacion = turno.practica;
      tipo = 'practica';
    } else if (turno.especialidad) {
      prestacion = turno.especialidad;
      tipo = 'especialidad';
    }

    if (!prestacion) {
      throw new Error(`Turno inválido sin prestación`);
    }

    // El objeto plan en BD debería estar instanciado como PlanPrepaga, PlanParticular, etc.
    // Si no hay paciente o este no tiene plan, instanciamos un particular como fallback.
    const planEfectivo = paciente && paciente.plan ? paciente.plan : new PlanParticular();

    const resultado = planEfectivo.calcularCosto(prestacion, tipo);
    return {
      tipoCobertura: resultado.nivel,
      costoEstimado: resultado.costo,
    };
  }
}

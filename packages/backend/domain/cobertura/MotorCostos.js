import { PlanParticular } from './PlanParticular.js';

export class MotorCostos {
  /**
   * Calcula cobertura y monto final para un turno según el paciente
   * @param {Turno} turno
   * @param {Paciente} paciente (Puede ser null si aún no se asignó paciente en la búsqueda, asumiremos particular)
   * @returns {Object} { tipoCobertura: String, costoEstimado: Number }
   */
  static calcularPara(turno, paciente) {
    let prestacion;
    let tipo;

    prestacion = turno.servicio;

    // La validación de "turno sin servicio" va ANTES de llamar a .esTipo(),
    // no después: si prestacion es undefined (datos legacy/corruptos), llamar
    // turno.servicio.esTipo() explota con un TypeError confuso en vez de este
    // error de dominio claro y catcheable.
    if (!prestacion) {
      throw new Error(`Turno inválido sin prestación`);
    }

    tipo = prestacion.esTipo();

    console.log('TIPO DE SERVICIO: ', tipo);

    console.log('PLAN:', paciente?.plan);

    // El objeto plan en BD debería estar instanciado como PlanPrepaga, PlanParticular, etc.
    // Si no hay paciente o este no tiene plan, instanciamos un particular como fallback.
    const planEfectivo = paciente && paciente.plan ? paciente.plan : new PlanParticular();

    console.log(planEfectivo.constructor.name);

    const resultado = planEfectivo.calcularCosto(prestacion, tipo);

    console.log('RESULTADO:', resultado);

    return {
      tipoCobertura: resultado.nivel,
      costoEstimado: resultado.costo,
    };
  }
}

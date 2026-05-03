import { logger } from "../../utils/logger.js";
import { tLog, tNegocio } from "../../utils/i18n/i18n.js";

export class ObraSocial {
  id;
  nombre;
  planes;

  constructor(nombre) {
    this.nombre = nombre;
    this.planes = [];
  }

  agregarPlan(plan) {
    this.planes.push(plan);
    logger.debug(tLog('LOG_PLAN_AGREGADO', { 
    plan: plan.nombre, 
    obraSocial: this.nombre 
}));
  }
}

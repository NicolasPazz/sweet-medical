import { logger } from "../../utils/logger.js";

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
    logger.debug(i18n.t('LOG_PLAN_AGREGADO', { 
    plan: plan.nombre, 
    obraSocial: this.nombre 
}));
  }
}

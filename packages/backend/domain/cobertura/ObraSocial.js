import { logger } from '../../utils/logger.js';

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
    logger.debug(`Plan ${plan.nombre} agregado a obra social ${this.nombre}`);
  }
}

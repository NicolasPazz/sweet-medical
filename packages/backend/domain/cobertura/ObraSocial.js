import { logger } from '../../utils/logger.js';

export class ObraSocial {
  id;
  nombre;
  planes;

  constructor(nombre) {
    /*if (nombre && typeof nombre === 'object' && !nombre.constructor.name.includes('ObjectId')) {
      Object.assign(this, nombre);
      this.id = this.id || this._id;
      return;
    }*/

    this.nombre = nombre;
    this.planes = [];
  }

  agregarPlan(plan) {
    this.planes.push(plan);
    logger.debug(`Plan ${plan.nombre} agregado a obra social ${this.nombre}`);
  }
}

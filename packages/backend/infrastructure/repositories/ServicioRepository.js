import { NotFoundError } from '../../errors/AppError.js';

export class ServicioRepository {
  constructor() {
    this.servicios = {};
    this.nextId = 1;
    // En Mongo, activo y tipo quedan como campos del documento, fuera del dominio
    this.activos = {};
  }

  // eslint-disable-next-line no-unused-vars
  save(servicio, _tipoServicio) {
    if (!servicio.id) {
      servicio.id = this.nextId++;
    }
    this.servicios[servicio.id] = servicio;
    this.activos[servicio.id] = true;
    return servicio;
  }

  obtenerPorId(id) {
    const servicio = this.servicios[id];
    if (!servicio || !this.activos[id]) {
      throw new NotFoundError('Servicio no encontrado');
    }
    return servicio;
  }

  obtenerTodos() {
    return Object.entries(this.servicios)
      .filter(([id]) => this.activos[id])
      .map(([, servicio]) => servicio);
  }

  modificar(id, datosActualizados) {
    const servicio = this.servicios[id];
    if (!servicio || !this.activos[id]) {
      throw new NotFoundError('Servicio no encontrado');
    }
    Object.assign(servicio, datosActualizados);
    return servicio;
  }

  eliminar(id) {
    const servicio = this.servicios[id];
    if (!servicio || !this.activos[id]) {
      throw new NotFoundError('Servicio no encontrado');
    }
    // Baja lógica: en Mongo sería { activo: false }
    this.activos[id] = false;
    return true;
  }
}

export const servicioRepository = new ServicioRepository();

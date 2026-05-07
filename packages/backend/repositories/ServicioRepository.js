import { NotFoundError } from "../errors/AppError.js";

export class ServicioRepository {
  constructor() {
    this.servicios = {};
    this.nextId = 1;
    // En Mongo, activo y tipo quedan como campos del documento, fuera del dominio
    this.activos = {};
  }

  // eslint-disable-next-line no-unused-vars
  guardar(servicio, _tipoServicio) {
    const id = this.nextId++;
    servicio.id = id;
    this.servicios[id] = servicio;
    this.activos[id] = true;
    return servicio;
  }

  obtenerPorId(id) {
    const servicio = this.servicios[id];
    if (!servicio || !this.activos[id]) return null;
    return servicio;
  }

  obtenerTodos() {
    return Object.entries(this.servicios)
      .filter(([id]) => this.activos[id])
      .map(([, servicio]) => servicio);
  }

  modificar(id, datosActualizados) {
    const servicio = this.obtenerPorId(id);
    if (!servicio) {
      throw new NotFoundError("Servicio no encontrado");
    }
    Object.assign(servicio, datosActualizados);
    return servicio;
  }

  eliminar(id) {
    // Baja lógica: en Mongo sería { activo: false }
    this.activos[id] = false;
    return true;
  }
}

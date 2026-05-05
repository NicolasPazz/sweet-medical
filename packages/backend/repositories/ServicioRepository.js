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

  findById(id) {
    return this.servicios[id];
  }

  modificar(id, datosActualizados) {
    const servicio = this.obtenerPorId(id);
    Object.assign(servicio, datosActualizados);
    return servicio;
  }

  eliminar(id) {
    // Baja lógica: en Mongo sería { activo: false }
    this.activos[id] = false;
    return true;
  }
}

export const servicioRepository = new ServicioRepository();
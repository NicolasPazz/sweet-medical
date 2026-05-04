export class ServicioRepository {
  constructor() {
    this.servicios = {};
    this.nextId = 1;
    // En Mongo, activo y tipo quedan como campos del documento, fuera del dominio
    this.activos = {};
  }

  // eslint-disable-next-line no-unused-vars
  save(servicio, _tipoServicio) {
    const id = this.nextId++;
    servicio.id = id;
    this.servicios[id] = servicio;
    this.activos[id] = true;
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

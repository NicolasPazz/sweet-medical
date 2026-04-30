import { Especialidad } from "../domain/servicios/Especialidad.js";
import { Practica } from "../domain/servicios/Practica.js";
import { ServicioRepository } from "../repositories/ServicioRepository.js";

export class ServicioService {
  constructor({ servicioRepository = new ServicioRepository() } = {}) {
    this.servicioRepository = servicioRepository;
  }

  agregar(datosServicio) {
    let servicio;
    if (datosServicio.tipo === "ESPECIALIDAD") {
      servicio = new Especialidad(
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo
      );
    } else if (datosServicio.tipo === "PRACTICA") {
      servicio = new Practica(
        datosServicio.codigo,
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo
      );
    }
    return this.servicioRepository.guardar(servicio, datosServicio.tipo);
  }

  modificar(id, datosActualizados) {
    const servicio = this.servicioRepository.modificar(Number(id), datosActualizados);
    return servicio;
  }

  eliminar(id) {
    this.servicioRepository.eliminar(Number(id));
  }
}

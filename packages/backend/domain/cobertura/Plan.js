export class Plan {
  id;
  nombre;
  coberturasEspecialidad;
  coberturasPractica;

  constructor(nombre) {
    this.nombre = nombre;
    this.coberturasEspecialidad = [];
    this.coberturasPractica = [];
  }

  obtenerCoberturaPorEspecialidad(especialidad) {
    const idBuscado = especialidad?.id ?? especialidad?._id;

    return this.coberturasEspecialidad.find(
      (c) => String(c.especialidad?.id || c.especialidad) === String(idBuscado),
    )?.nivel;
  }

  obtenerCoberturaPorPractica(practica) {
    const idBuscado = practica?.id ?? practica?._id;

    return this.coberturasPractica.find(
      (c) => String(c.practica?.id || c.practica) === String(idBuscado),
    )?.nivel;
  }

  calcularCosto() {
    throw new Error('calcularCosto debe ser implementado por subclases');
  }
}

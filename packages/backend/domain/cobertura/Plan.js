export class Plan {
  constructor(id, nombre) {
    this.id = id;
    this.nombre = nombre;
    this.coberturasEspecialidad = [];
    this.coberturasPractica = [];
  }

  obtenerCoberturaPorEspecialidad(especialidad) {
    return this.coberturasEspecialidad.find(
      (cobertura) => cobertura.especialidad.id == especialidad.id
    );
  }

  obtenerCoberturaPorPractica(practica) {
    return this.coberturasPractica.find((cobertura) => cobertura.practica.id == practica.id);
  }
}

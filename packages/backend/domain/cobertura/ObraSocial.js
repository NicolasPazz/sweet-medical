export class ObraSocial {
  constructor(id, nombre, planes) {
    this.id = id;
    this.nombre = nombre;
    this.planes = planes;
  }

  agregarPlan(plan) {
    this.planes.push(plan);
  }
}

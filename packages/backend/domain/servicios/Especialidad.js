export class Especialidad {
  id;
  nombre;
  duracionTurnoEnMins;
  costo;

  constructor(nombre, duracionTurnoEnMins, costo) {
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costo = costo;
    this.tipo = 'ESPECIALIDAD';
  }
}

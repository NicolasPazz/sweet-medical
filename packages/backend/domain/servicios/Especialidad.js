export class Especialidad {
  id;
  nombre;
  duracionTurnoEnMins;
  costo;

  constructor(nombre, duracionTurnoEnMins, costoConsulta) {
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costoConsulta = costoConsulta;
  }
}

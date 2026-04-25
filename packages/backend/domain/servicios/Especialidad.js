export class Especialidad {
  id;
  nombre;
  duracionTurnoEnMins;
  costoConsulta;

  constructor(nombre, duracionTurnoEnMins, costoConsulta) {
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costoConsulta = costoConsulta;
  }
}

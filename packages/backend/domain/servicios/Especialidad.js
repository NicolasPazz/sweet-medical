export class Especialidad {
  id;
  nombre;
  duracionTurnoEnMins;
  costo;

  constructor(nombre, duracionTurnoEnMins, costo) {
    /*if (nombre && typeof nombre === 'object' && !nombre.constructor.name.includes('ObjectId')) {
      Object.assign(this, nombre);
      this.id = this.id || this._id;
      return;
    }*/

    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costo = costo;
  }
}

export class Practica {
  id;
  codigo;
  nombre;
  duracionTurnoEnMins;
  costo;

  constructor(codigo, nombre, duracionTurnoEnMins, costo) {
    /*if (codigo && typeof codigo === 'object' && !codigo.constructor.name.includes('ObjectId')) {
      Object.assign(this, codigo);
      this.id = this.id || this._id;
      return;
    }*/

    this.codigo = codigo;
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costo = costo;
  }
}

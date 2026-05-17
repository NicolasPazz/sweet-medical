export class Sede {
  id;
  nombre;
  direccion;

  constructor(nombre, direccion) {
    /*if (nombre && typeof nombre === 'object' && !nombre.constructor.name.includes('ObjectId')) {
      Object.assign(this, nombre);
      this.id = this.id || this._id;
      return;
    }*/

    this.nombre = nombre;
    this.direccion = direccion;
  }
}

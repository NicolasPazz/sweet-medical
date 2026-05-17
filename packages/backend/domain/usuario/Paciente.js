export class Paciente {
  id;
  usuario;
  dni;
  nombre;
  obraSocial;
  plan;

  constructor(usuario, dni, nombre, obraSocial, plan) {
    /*if (usuario && typeof usuario === 'object' && !usuario.constructor.name.includes('ObjectId')) {
      Object.assign(this, usuario);
      this.id = this.id || this._id;
      return;
    }*/

    this.usuario = usuario;
    this.dni = dni;
    this.nombre = nombre;
    this.obraSocial = obraSocial;
    this.plan = plan;
  }
}

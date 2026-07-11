export class Paciente {
  id;
  usuario;
  nombre;
  obraSocial;
  plan;

  constructor(usuario, dni, nombre, obraSocial, plan) {
    this.usuario = usuario;
    this.nombre = nombre;
    this.obraSocial = obraSocial;
    this.plan = plan;
  }
}

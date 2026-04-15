export class Medico {
  constructor(id, usuario, matricula, nombre) {
    this.id = id; // ES UN STRING!!!!!!!!!!!!!!
    this.usuario = usuario;
    this.matricula = matricula; // ES UN STRING!!!!!!!!!!!!!!
    this.nombre = nombre; // ES UN STRING!!!!!!!!!!!!!!
    this.especialidades = [];
    this.practicas = [];
    this.sedes = [];
    this.disponibilidades = [];
  }

  definirDisponibilidad(disponibilidad) {
    this.disponibilidades.push(disponibilidad);
  }
}

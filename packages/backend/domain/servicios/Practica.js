export class Practica {
  id;
  codigo;
  nombre;
  duracionTurnoEnMins;
  costo;

  constructor(codigo, nombre, duracionTurnoEnMins, costo) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.duracionTurnoEnMins = duracionTurnoEnMins;
    this.costo = costo;
    this.tipo = 'PRACTICA';
  }

  esTipo(){
    return this.tipo || 'PRACTICA';
  }
}

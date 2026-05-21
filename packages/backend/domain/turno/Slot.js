export class Slot {
  _id;
  medico;
  fecha;
  horaInicio;
  duracionMins;
  estado;
  turnoAsociado;

  constructor(medico, fecha, horaInicio, duracionMins) {
    this.medico = medico;
    this.fecha = fecha;
    this.horaInicio = horaInicio;
    this.duracionMins = duracionMins;
    this.estado = 'DISPONIBLE';
  }
}

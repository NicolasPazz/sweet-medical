export class CambioEstadoTurno {
  fechaHoraIngreso;
  estado;
  turno;
  usuario;
  motivo;

  constructor(estado, turno, usuario, motivo) {
    this.fechaHoraIngreso = new Date();
    this.estado = estado;
    this.turno = turno;
    this.usuario = usuario;
    this.motivo = motivo;
  }
}

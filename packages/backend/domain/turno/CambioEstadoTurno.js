export class CambioEstadoTurno {
  id;
  fechaHoraIngreso;
  estado; // Enum EstadoTurno
  turno;
  usuario;
  motivo;

  constructor(estado, turno, usuario, motivo) {
    this.fechaHoraIngreso = new Date();
    this.estado = estado;
    this.turno = turno;
    this.usuario = usuario?.id || usuario?._id || usuario;
    this.motivo = motivo;
  }
}

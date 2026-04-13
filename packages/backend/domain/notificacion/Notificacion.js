export class Notificacion {
  constructor(id, destinatario, remitente, mensaje) {
    this.id = id;
    this.destinatario = destinatario;
    this.remitente = remitente;
    this.mensaje = mensaje;
    
    this.fechaHoraCreacion = new Date();
    
    this.fechaHoraLeida = null; 
    this.leida = false;
  }

  marcarComoLeida() {
    this.leida = true;
    this.fechaHoraLeida = new Date();
    console.log(`Notificación ${this.id} marcada como leída el: ${this.fechaHoraLeida}`);
  }
}
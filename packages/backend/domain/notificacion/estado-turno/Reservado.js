import { logger } from '../../../utils/logger.js';
import { Notificacion } from '../Notificacion.js';
import { EstadoTurno } from '../../turno/EstadoTurno.js';

export class Reservado {
  id;
  constructor(turno) {
    this.turno = turno;
  }

  getEstadoNombre() {
    return EstadoTurno.RESERVADO;
  }

  notificar(remitente) {
    const servicio = this.turno.obtenerNombreServicio();
    logger.debug(
      `Creando notificación para turno ${this.turno.id} en estado RESERVADO por paciente ${this.turno.paciente.nombre} para servicio ${servicio}.`,
    );

    // 🚀 CORRECCIÓN CLAVE: Extraemos explícitamente el .id o ._id de los usuarios
    // en lugar de enviarle el objeto completo a Mongoose.
    const destinatarioId = this.turno.medico.usuario?.toString
      ? this.turno.medico.usuario.toString()
      : String(this.turno.medico.usuario);
    const remitenteId = remitente.id?.toString
      ? remitente.id.toString()
      : (remitente._id ?? remitente).toString();

    return new Notificacion(
      destinatarioId, // Pasa el ID limpio (ej: string de 24 caracteres)
      remitenteId, // Pasa el ID limpio (ej: '000000000000000000000001')
      `Nuevo turno reservado por paciente ${this.turno.paciente.nombre} para ${servicio}.`,
    );
  }
}

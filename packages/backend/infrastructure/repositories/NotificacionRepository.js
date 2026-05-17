import { NotificacionModel } from '../schemas/NotificacionSchema.js';
import { NotFoundError } from '../../errors/AppError.js';
import { Notificacion } from '../../domain/notificacion/Notificacion.js';

export class NotificacionRepository {
  _hidratar(datos) {
    return this.fromDB(datos);
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this._hidratar(d));
  }

  // CREAR
  async save(notificacion) {
    if (notificacion._id) {
      const actualizada = await NotificacionModel.findByIdAndUpdate(
        notificacion._id,
        notificacion,
        { new: true },
      )
        .populate('destinatario')
        .populate('remitente')
        .lean();
      return this._hidratar(actualizada);
    } else {
      const saved = await NotificacionModel.create(notificacion);
      const completa = await NotificacionModel.findById(saved._id)
        .populate('destinatario')
        .populate('remitente')
        .lean();
      return this._hidratar(completa);
    }
  }

  // LEER
  async findById(id) {
    const notificacion = await NotificacionModel.findById(id)
      .populate('destinatario')
      .populate('remitente')
      .lean();
    if (!notificacion) throw new NotFoundError('Notificación no encontrada');
    return this._hidratar(notificacion);
  }

  async findAllReadByUserId(userId) {
    const notificaciones = await NotificacionModel.find({ destinatario: userId, leida: true })
      .populate('destinatario')
      .populate('remitente')
      .sort({ fechaHoraCreacion: -1 })
      .lean();
    return this._hidratarColeccion(notificaciones);
  }

  async findAllUnreadByUserId(userId) {
    const notificaciones = await NotificacionModel.find({ destinatario: userId, leida: false })
      .populate('destinatario')
      .populate('remitente')
      .sort({ fechaHoraCreacion: -1 })
      .lean();
    return this._hidratarColeccion(notificaciones);
  }

  async obtenerLeidas(idUsuario) {
    return this.findAllReadByUserId(idUsuario);
  }

  async obtenerNoLeidas(idUsuario) {
    return this.findAllUnreadByUserId(idUsuario);
  }

  // ACTUALIZAR
  async markAsRead(id) {
    const notificacion = await NotificacionModel.findByIdAndUpdate(
      id,
      { leida: true, fechaHoraLeida: new Date() },
      { new: true },
    )
      .populate('destinatario')
      .populate('remitente')
      .lean();
    if (!notificacion) throw new NotFoundError('Notificación no encontrada');
    return this._hidratar(notificacion);
  }

  async marcarComoLeida(id) {
    return this.markAsRead(id);
  }

  async fromDB(datos) {
    const notificacion = Object.create(Notificacion.prototype);
    notificacion.id = datos._id ?? datos.id;
    notificacion.destinatario = datos.destinatario;
    notificacion.remitente = datos.remitente;
    notificacion.mensaje = datos.mensaje;
    notificacion.fechaHoraCreacion = datos.fechaHoraCreacion;
    notificacion.fechaHoraLeida = datos.fechaHoraLeida;
    notificacion.leida = datos.leida;
    return notificacion;
  }
}

export const notificacionRepository = new NotificacionRepository();

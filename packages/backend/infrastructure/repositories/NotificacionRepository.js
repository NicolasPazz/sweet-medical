import { NotificacionModel } from '../schemas/NotificacionSchema.js';
import { NotFoundError } from '../../errors/AppError.js';

export class NotificacionRepository {
  // CREATE
  async save(notificacion) {
    if (notificacion._id) {
      return await NotificacionModel.findByIdAndUpdate(notificacion._id, notificacion, {
        new: true,
      })
        .populate('destinatario')
        .populate('remitente');
    } else {
      const newNotificacion = new NotificacionModel(notificacion);
      const savedNotificacion = await newNotificacion.save();
      await savedNotificacion.populate('destinatario');
      return savedNotificacion;
    }
  }

  // READ
  async findById(id) {
    const notificacion = await NotificacionModel.findById(id)
      .populate('destinatario')
      .populate('remitente');
    if (!notificacion) {
      throw new NotFoundError('Notificación no encontrada');
    }
    return notificacion;
  }

  async findAllReadByUserId(userId) {
    return await NotificacionModel.find({
      destinatario: userId,
      leida: true,
    })
      .populate('destinatario')
      .populate('remitente')
      .sort({ fechaHoraCreacion: -1 });
  }

  async findAllUnreadByUserId(userId) {
    return await NotificacionModel.find({
      destinatario: userId,
      leida: false,
    })
      .populate('destinatario')
      .populate('remitente')
      .sort({ fechaHoraCreacion: -1 });
  }

  async obtenerLeidas(idUsuario) {
    return this.findAllReadByUserId(idUsuario);
  }

  async obtenerNoLeidas(idUsuario) {
    return this.findAllUnreadByUserId(idUsuario);
  }

  // UPDATE
  async markAsRead(id) {
    const notificacion = await NotificacionModel.findByIdAndUpdate(
      id,
      {
        leida: true,
        fechaHoraLeida: new Date(),
      },
      { new: true },
    )
      .populate('destinatario')
      .populate('remitente');

    if (!notificacion) {
      throw new NotFoundError('Notificación no encontrada');
    }
    return notificacion;
  }

  async marcarComoLeida(id) {
    return this.markAsRead(id);
  }

  // DELETE
  // No hay método delete definido
}

export const notificacionRepository = new NotificacionRepository();

import { NotificacionModel } from '../schemas/NotificacionSchema.js';
import { NotFoundError } from '../../errors/AppError.js';

export class NotificacionRepository {
  constructor() {
    this.model = NotificacionModel;
  }

  // LEER
  async findById(id) {
    const notificacion = await NotificacionModel.findById(id);
    if (!notificacion) throw new NotFoundError('Notificación no encontrada');
    return notificacion;
  }

  async findAllReadByUserId(userId) {
    return await NotificacionModel.find({ destinatario: userId, leida: true }).sort({
      fechaHoraCreacion: -1,
    });
  }

  async findAllUnreadByUserId(userId) {
    return await NotificacionModel.find({ destinatario: userId, leida: false }).sort({
      fechaHoraCreacion: -1,
    });
  }

  // CREAR
  async save(notificacion) {
    const id = notificacion.id || notificacion._id;

    const datosAPersistir = {
      ...notificacion,
      destinatario:
        notificacion.destinatario?.id ||
        notificacion.destinatario?._id ||
        notificacion.destinatario,
      remitente:
        notificacion.remitente?.id || notificacion.remitente?._id || notificacion.remitente,
    };

    if (id) {
      return await NotificacionModel.findByIdAndUpdate(id, datosAPersistir, { new: true });
    }
    return await NotificacionModel.create(datosAPersistir);
  }

  // ACTUALIZAR
  async markAsRead(id) {
    const notificacion = await NotificacionModel.findByIdAndUpdate(
      id,
      { leida: true, fechaHoraLeida: new Date() },
      { new: true },
    );
    if (!notificacion) throw new NotFoundError('Notificación no encontrada');
    return notificacion;
  }
}

export const notificacionRepository = new NotificacionRepository();

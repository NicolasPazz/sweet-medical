import mongoose from 'mongoose';
import { Notificacion } from '../../domain/notificacion/Notificacion.js';

const notificacionSchema = new mongoose.Schema(
  {
    destinatario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    remitente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    mensaje: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    fechaHoraCreacion: { type: Date, default: Date.now },
    fechaHoraLeida: { type: Date, default: null },
    leida: { type: Boolean, default: false },
  },
  { collection: 'notificaciones' },
);

notificacionSchema.index({ destinatario: 1, leida: 1, fechaHoraCreacion: -1 });

notificacionSchema.loadClass(Notificacion);

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

import mongoose from 'mongoose';
import { Notificacion } from '../../domain/notificacion/Notificacion.js';

const notificacionSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    turno: { type: mongoose.Schema.Types.ObjectId, ref: 'Turno' },
    tipo: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    mensaje: { type: String, required: true, trim: true, minlength: 5, maxlength: 1000 },
    leida: { type: Boolean, default: false },
    fechaCreacion: { type: Date, default: Date.now },
    fechaLectura: { type: Date },
  },
  { timestamps: true, collection: 'notificaciones' },
);

notificacionSchema.loadClass(Notificacion);

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

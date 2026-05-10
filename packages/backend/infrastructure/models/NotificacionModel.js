import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  turno: { type: mongoose.Schema.Types.ObjectId, ref: 'Turno' },
  tipo: { type: String, required: true },
  mensaje: { type: String, required: true },
  leida: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
  fechaLectura: { type: Date },
});

export const NotificacionModel = mongoose.model('Notificacion', notificacionSchema);

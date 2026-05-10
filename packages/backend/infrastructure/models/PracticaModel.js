import mongoose from 'mongoose';

const practicaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  descripcion: { type: String },
  duracionTurnoEnMins: { type: Number, default: 30 },
  costo: { type: Number, required: true },
  activo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PracticaModel = mongoose.model('Practica', practicaSchema);

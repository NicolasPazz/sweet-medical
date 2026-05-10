import mongoose from 'mongoose';

const sedeSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  provincia: { type: String, required: true },
  codigoPostal: { type: String },
  telefono: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const SedeModel = mongoose.model('Sede', sedeSchema);

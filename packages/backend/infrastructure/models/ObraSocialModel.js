import mongoose from 'mongoose';

const obraSocialSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  codigo: { type: String, required: true, unique: true },
  contacto: { type: String },
  telefono: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const ObraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);

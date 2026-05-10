import mongoose from 'mongoose';
import { ObraSocial } from '../../domain/cobertura/ObraSocial.js';

const obraSocialSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    codigo: { type: String, required: true, unique: true, trim: true, minlength: 1, maxlength: 30 },
    contacto: { type: String, trim: true, maxlength: 100 },
    telefono: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 100 },
  },
  { timestamps: true, collection: 'obras_sociales' },
);

obraSocialSchema.loadClass(ObraSocial);

export const ObraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);

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
    planes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
  },
  { collection: 'obras_sociales' },
);

obraSocialSchema.loadClass(ObraSocial);

export const ObraSocialModel = mongoose.model('ObraSocial', obraSocialSchema);

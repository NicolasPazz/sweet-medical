import mongoose from 'mongoose';
import { Sede } from '../../domain/servicios/Sede.js';

const sedeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    direccion: { type: String, required: true, trim: true, maxlength: 200 },
    ciudad: { type: String, required: true, trim: true, maxlength: 100 },
    provincia: { type: String, required: true, trim: true, maxlength: 100 },
    codigoPostal: { type: String, trim: true, maxlength: 20 },
    telefono: { type: String, trim: true, maxlength: 30 },
    email: { type: String, trim: true, lowercase: true, maxlength: 100 },
  },
  { timestamps: true, collection: 'sedes' },
);

sedeSchema.loadClass(Sede);

export const SedeModel = mongoose.model('Sede', sedeSchema);

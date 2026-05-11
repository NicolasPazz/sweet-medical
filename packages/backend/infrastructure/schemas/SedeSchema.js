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
  },
  { timestamps: true, collection: 'sedes' },
);

sedeSchema.loadClass(Sede);

export const SedeModel = mongoose.model('Sede', sedeSchema);

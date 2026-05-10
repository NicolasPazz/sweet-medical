import mongoose from 'mongoose';
import { Practica } from '../../domain/servicios/Practica.js';

const practicaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    descripcion: { type: String, trim: true, maxlength: 500 },
    duracionTurnoEnMins: { type: Number, default: 30, min: 1, max: 480 },
    costo: { type: Number, required: true, min: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'practicas' },
);

practicaSchema.loadClass(Practica);

export const PracticaModel = mongoose.model('Practica', practicaSchema);

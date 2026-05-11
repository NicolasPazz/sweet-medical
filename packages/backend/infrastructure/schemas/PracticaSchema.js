import mongoose from 'mongoose';
import { Practica } from '../../domain/servicios/Practica.js';

const practicaSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    duracionTurnoEnMins: {
      type: Number,
      required: true,
      min: 1,
      max: 480,
    },
    costo: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { collection: 'practicas' },
);

practicaSchema.loadClass(Practica);

export const PracticaModel = mongoose.model('Practica', practicaSchema);

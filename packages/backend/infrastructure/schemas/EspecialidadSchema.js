import mongoose from 'mongoose';
import { Especialidad } from '../../domain/servicios/Especialidad.js';

const especialidadSchema = new mongoose.Schema(
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
  { timestamps: true, collection: 'especialidades' },
);

especialidadSchema.loadClass(Especialidad);

export const EspecialidadModel = mongoose.model('Especialidad', especialidadSchema);

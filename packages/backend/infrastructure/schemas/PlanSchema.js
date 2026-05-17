import mongoose from 'mongoose';
import { Plan } from '../../domain/cobertura/Plan.js';
import { NivelCobertura } from '../../domain/cobertura/NivelCobertura.js';

const coberturaEspecialidadSchema = new mongoose.Schema(
  {
    especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad', required: true },
    nivel: {
      type: String,
      required: true,
      enum: Object.values(NivelCobertura),
    },
  },
  { _id: false },
);

const coberturaPracticaSchema = new mongoose.Schema(
  {
    practica: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica', required: true },
    nivel: {
      type: String,
      required: true,
      enum: Object.values(NivelCobertura),
    },
  },
  { _id: false },
);

const planSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    coberturasEspecialidad: [coberturaEspecialidadSchema],
    coberturasPractica: [coberturaPracticaSchema],
  },
  { collection: 'planes', discriminatorKey: 'tipoPlan' },
);

planSchema.loadClass(Plan);

export const PlanModel = mongoose.model('Plan', planSchema);

import mongoose from 'mongoose';
import { Plan } from '../../domain/cobertura/Plan.js';

const planSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    obraSocial: { type: mongoose.Schema.Types.ObjectId, ref: 'ObraSocial', required: true },
    descripcion: { type: String, trim: true, maxlength: 500 },
    coberturasIncluidas: [
      {
        especialidadOPractica: { type: mongoose.Schema.Types.ObjectId },
        porcentajeCobertura: { type: Number, required: true, min: 0, max: 100 },
        costoAfiliadoFijo: { type: Number, min: 0 },
        deducible: { type: Number, min: 0 },
      },
    ],
  },
  { timestamps: true, collection: 'planes' },
);

planSchema.loadClass(Plan);

export const PlanModel = mongoose.model('Plan', planSchema);

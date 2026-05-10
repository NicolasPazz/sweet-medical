import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  obraSocial: { type: mongoose.Schema.Types.ObjectId, ref: 'ObraSocial', required: true },
  descripcion: { type: String },
  coberturasIncluidas: [
    {
      especialidadOPractica: { type: mongoose.Schema.Types.ObjectId },
      porcentajeCobertura: { type: Number, required: true },
      costoAfiliadoFijo: { type: Number },
      deducible: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PlanModel = mongoose.model('Plan', planSchema);

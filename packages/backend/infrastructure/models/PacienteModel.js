import mongoose from 'mongoose';

const pacienteSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  numeroAfiliado: { type: String, required: true },
  nombre: { type: String, required: true },
  obraSocial: { type: mongoose.Schema.Types.ObjectId, ref: 'ObraSocial' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PacienteModel = mongoose.model('Paciente', pacienteSchema);

import mongoose from 'mongoose';

const medicoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  matricula: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  especialidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' }],
  practicas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practica' }],
  sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
  disponibilidades: [
    {
      diaSemana: { type: String, required: true },
      horaDesde: { type: String, required: true },
      horaHasta: { type: String, required: true },
    },
  ],
  turnosActualesYFuturos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Turno' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const MedicoModel = mongoose.model('Medico', medicoSchema);

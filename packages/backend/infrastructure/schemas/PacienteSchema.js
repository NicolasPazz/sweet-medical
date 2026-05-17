import mongoose from 'mongoose';
import { Paciente } from '../../domain/usuario/Paciente.js';

const pacienteSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    dni: { type: String, required: true, trim: true, minlength: 7, maxlength: 9 },
    nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    obraSocial: { type: mongoose.Schema.Types.ObjectId, ref: 'ObraSocial' },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  },
  { timestamps: true, collection: 'pacientes' },
);

pacienteSchema.pre(/^find/, function (next) {
  this.populate('usuario').populate('obraSocial').populate('plan');
  next();
});

pacienteSchema.loadClass(Paciente);

export const PacienteModel = mongoose.model('Paciente', pacienteSchema);

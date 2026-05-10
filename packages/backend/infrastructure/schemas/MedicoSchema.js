import mongoose from 'mongoose';
import { Medico } from '../../domain/usuario/Medico.js';

const medicoSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    matricula: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 50,
    },
    nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    especialidades: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' }],
    practicas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Practica' }],
    sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
    disponibilidades: [
      {
        diaSemana: { type: String, required: true, trim: true, maxlength: 20 },
        horaDesde: { type: String, required: true, trim: true, maxlength: 10 },
        horaHasta: { type: String, required: true, trim: true, maxlength: 10 },
      },
    ],
    turnosActualesYFuturos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Turno' }],
  },
  { timestamps: true, collection: 'medicos' },
);

medicoSchema.loadClass(Medico);

export const MedicoModel = mongoose.model('Medico', medicoSchema);

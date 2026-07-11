import mongoose from 'mongoose';
import { Medico } from '../../domain/usuario/Medico.js';
import { DiaSemana } from '../../utils/enum/DiaSemana.js';

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
        _id: false,
        diaSemana: { type: String, required: true, enum: Object.values(DiaSemana) },
        horaDesde: { type: String, required: true, trim: true, maxlength: 10 },
        horaHasta: { type: String, required: true, trim: true, maxlength: 10 },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'medicos',
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

medicoSchema.virtual('turnosActualesYFuturos', {
  ref: 'Turno',
  localField: '_id',
  foreignField: 'medico',
});

medicoSchema.pre(/^find/, function (next) {
  this.populate('usuario')
    .populate({ path: 'especialidades', match: { activo: true } })
    .populate({ path: 'practicas', match: { activo: true } })
    .populate('sedes');
  next();
});

medicoSchema.loadClass(Medico);

export const MedicoModel = mongoose.model('Medico', medicoSchema);

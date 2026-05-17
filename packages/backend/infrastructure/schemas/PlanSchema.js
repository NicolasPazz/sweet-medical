import mongoose from 'mongoose';
import { Plan } from '../../domain/cobertura/Plan.js';
import { PlanPrepaga } from '../../domain/cobertura/PlanPrepaga.js';
import { PlanParticular } from '../../domain/cobertura/PlanParticular.js';
import { NivelCobertura } from '../../domain/cobertura/NivelCobertura.js';

const coberturaEspecialidadSchema = new mongoose.Schema(
  {
    especialidad: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad', required: true },
    nivel: { type: String, required: true, enum: Object.values(NivelCobertura) },
  },
  { _id: false },
);

const coberturaPracticaSchema = new mongoose.Schema(
  {
    practica: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica', required: true },
    nivel: { type: String, required: true, enum: Object.values(NivelCobertura) },
  },
  { _id: false },
);

const planSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    coberturasEspecialidad: [coberturaEspecialidadSchema],
    coberturasPractica: [coberturaPracticaSchema],
    tipoPlan: { type: String, required: true },
  },
  { collection: 'planes', discriminatorKey: 'tipoPlan' },
);

planSchema.pre(/^find/, function (next) {
  this.populate('coberturasEspecialidad.especialidad').populate('coberturasPractica.practica');
  next();
});

planSchema.loadClass(Plan);
export const PlanModel = mongoose.model('Plan', planSchema);

const planPrepagaSchema = new mongoose.Schema({});
planPrepagaSchema.loadClass(PlanPrepaga);
export const PlanPrepagaModel = PlanModel.discriminator('Prepaga', planPrepagaSchema);

const planParticularSchema = new mongoose.Schema({});
planParticularSchema.loadClass(PlanParticular);
export const PlanParticularModel = PlanModel.discriminator('Particular', planParticularSchema);

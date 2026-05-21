import mongoose from 'mongoose';
import { Slot } from '../../domain/turno/Slot.js';

const slotSchema = new mongoose.Schema(
  {
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    fecha: { type: String, required: true, trim: true },       // 'YYYY-MM-DD'
    horaInicio: { type: String, required: true, trim: true },  // 'HH:MM'
    duracionMins: { type: Number, required: true, min: 1 },
    estado: {
      type: String,
      required: true,
      trim: true,
      enum: ['DISPONIBLE', 'RESERVADO', 'OCUPADO'],
      default: 'DISPONIBLE',
    },
    turnoAsociado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Turno',
      default: null,
    },
  },
  { collection: 'slots' },
);

slotSchema.index({ medico: 1, estado: 1 });
slotSchema.index({ medico: 1, fecha: 1, horaInicio: 1 }, { unique: true });

slotSchema.loadClass(Slot);

export const SlotModel = mongoose.model('Slot', slotSchema);

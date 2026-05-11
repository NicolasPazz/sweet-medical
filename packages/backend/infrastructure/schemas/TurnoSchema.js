import mongoose from 'mongoose';
import { Turno } from '../../domain/turno/Turno.js';
import { CambioEstadoTurno } from '../../domain/turno/CambioEstadoTurno.js';

const cambioEstadoTurnoSchema = new mongoose.Schema(
  {
    fechaHoraIngreso: { type: Date, default: Date.now },
    estado: { type: mongoose.Schema.Types.Mixed, required: true },
    turno: { type: mongoose.Schema.Types.ObjectId, ref: 'Turno' },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    motivo: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: true },
);

cambioEstadoTurnoSchema.loadClass(CambioEstadoTurno);

const turnoSchema = new mongoose.Schema(
  {
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', default: null },
    servicio: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      nombre: { type: String, required: true, trim: true, maxlength: 100 },
      costo: { type: Number, required: true, min: 0 },
    },
    sede: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
      nombre: { type: String, required: true, trim: true, maxlength: 100 },
    },
    diaSemana: { type: String, required: true, trim: true, maxlength: 20 },
    hora: { type: String, required: true, trim: true, maxlength: 10 },
    fechaHora: { type: Date, default: null },
    estado: { type: mongoose.Schema.Types.Mixed, required: true },
    costo: { type: Number, required: true, min: 0 },
    historialEstados: [cambioEstadoTurnoSchema],
  },
  { collection: 'turnos' },
);

turnoSchema.loadClass(Turno);

export const TurnoModel = mongoose.model('Turno', turnoSchema);

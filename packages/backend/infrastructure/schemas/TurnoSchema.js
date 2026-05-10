import mongoose from 'mongoose';
import { Turno } from '../../domain/turno/Turno.js';

const turnoSchema = new mongoose.Schema(
  {
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
    especialidad: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' },
      nombre: { type: String, required: true, trim: true, maxlength: 100 },
    },
    practica: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica' },
      nombre: { type: String, required: true, trim: true, maxlength: 100 },
      costoBase: { type: Number, required: true, min: 0 },
    },
    sede: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede' },
      nombre: { type: String, required: true, trim: true, maxlength: 100 },
    },
    diaSemana: { type: String, required: true, trim: true, maxlength: 20 },
    hora: { type: String, required: true, trim: true, maxlength: 10 },
    fechaHora: { type: Date },
    estado: {
      type: String,
      required: true,
      enum: ['DISPONIBLE', 'RESERVADO', 'CANCELADO', 'REALIZADO'],
      trim: true,
    },
    costo: { type: Number, required: true, min: 0 },
    historialEstados: [
      {
        estado: { type: String, trim: true, maxlength: 50 },
        quien: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
        motivo: { type: String, trim: true, maxlength: 500 },
        fecha: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'turnos' },
);

turnoSchema.loadClass(Turno);

export const TurnoModel = mongoose.model('Turno', turnoSchema);

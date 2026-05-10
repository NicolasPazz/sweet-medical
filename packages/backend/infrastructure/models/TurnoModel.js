import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
  especialidad: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Especialidad' },
    nombre: { type: String, required: true },
  },
  practica: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Practica' },
    nombre: { type: String, required: true },
    costoBase: { type: Number, required: true },
  },
  sede: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede' },
    nombre: { type: String, required: true },
  },
  diaSemana: { type: String, required: true },
  hora: { type: String, required: true },
  fechaHora: { type: Date },
  estado: {
    type: String,
    required: true,
    enum: ['DISPONIBLE', 'RESERVADO', 'CANCELADO', 'REALIZADO'],
  },
  costo: { type: Number, required: true },
  historialEstados: [
    {
      estado: String,
      quien: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      motivo: String,
      fecha: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const TurnoModel = mongoose.model('Turno', turnoSchema);

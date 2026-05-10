import mongoose from 'mongoose';

const turnoSchema = new mongoose.Schema({
  medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico' },
  especialidad: {
    nombre: String,
  },
  practica: {
    nombre: String,
    costoBase: Number,
  },
  sede: {
    nombre: String,
  },
  fechaHora: Date,
  estado: String,
});

export const TurnoModel = mongoose.model('Turno', turnoSchema);

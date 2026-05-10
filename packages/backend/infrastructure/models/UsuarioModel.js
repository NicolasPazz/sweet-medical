import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  roles: [{ type: String, enum: ['MEDICO', 'PACIENTE', 'ADMIN'] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

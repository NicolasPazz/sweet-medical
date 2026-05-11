import mongoose from 'mongoose';
import { Usuario } from '../../domain/usuario/Usuario.js';

const usuarioSchema = new mongoose.Schema(
  {
    nombreUsuario: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 128,
    },
    roles: [
      {
        type: String,
        enum: ['MEDICO', 'PACIENTE', 'ADMIN'],
        trim: true,
      },
    ],
  },
  { collection: 'usuarios' },
);

usuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

import mongoose from 'mongoose';
import { Usuario } from '../../domain/usuario/Usuario.js';
import { Rol } from '../../domain/usuario/Rol.js';

const usuarioSchema = new mongoose.Schema(
  {
    nombreUsuario: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 6,
      maxlength: 128,
    },
    roles: {
      type: [
        {
          type: String,
          enum: Object.values(Rol),
        },
      ],
      default: [],
    },
    dni: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 7,
      maxlength: 9,
    },
    activo: {
      type: Boolean,
      default: false,
    },
    numTel: {
      type: String,
      required: false,
      trim: true,
      maxlength: 20,
    },
    direccion: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200,
    },
    fechaNacimiento: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true, collection: 'usuarios' },
);

usuarioSchema.loadClass(Usuario);

export const UsuarioModel = mongoose.model('Usuario', usuarioSchema);

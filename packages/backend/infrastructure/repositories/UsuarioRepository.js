import { NotFoundError } from '../../errors/AppError.js';
import { UsuarioModel } from '../schemas/UsuarioSchema.js';

export class UsuarioRepository {
  // CREAR
  async save(usuario) {
    if (usuario._id) {
      return await UsuarioModel.findByIdAndUpdate(usuario._id, usuario, { new: true });
    } else {
      const newUsuario = new UsuarioModel(usuario);
      return await newUsuario.save();
    }
  }

  async saveAll(usuarios) {
    return await UsuarioModel.insertMany(usuarios);
  }

  // LEER
  async findById(id) {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return usuario;
  }

  async findAll() {
    return await UsuarioModel.find();
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const usuario = await UsuarioModel.findByIdAndUpdate(id, datosActualizados, { new: true });
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return usuario;
  }

  // ELIMINAR
  async delete(id) {
    const result = await UsuarioModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Usuario no encontrado');
    }
    return true;
  }

  async deleteAll() {
    return await UsuarioModel.deleteMany({});
  }

  async findUsuarioAdmin() {
    return await UsuarioModel.findOne({ roles: 'ADMIN' });
  }

  
}

export const usuarioRepository = new UsuarioRepository();

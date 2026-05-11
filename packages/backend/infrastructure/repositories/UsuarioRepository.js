import { UsuarioModel } from '../models/UsuarioModel.js';

export class UsuarioRepository {

  async save(usuario) {
    return await UsuarioModel.create(usuario);
  }

  async findById(id) {
    return await UsuarioModel.findById(id);
  }

  async findAll() {
    return await UsuarioModel.find();
  }

  async modificar(id, datos) {
    return await UsuarioModel.findByIdAndUpdate(
      id,
      datos,
      { new: true }
    );
  }

  async eliminar(id) {
    return await UsuarioModel.findByIdAndDelete(id);
  }
}

export const usuarioRepository = new UsuarioRepository();
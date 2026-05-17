import { UsuarioModel } from '../schemas/UsuarioSchema.js';

export class UsuarioRepository {
  constructor() {
    this.model = UsuarioModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findUsuarioAdmin() {
    return await this.model.findOne({ roles: 'ADMIN' });
  }

  // CREAR
  async save(usuario) {
    const id = usuario.id || usuario._id;

    if (id) {
      return await this.update(id, usuario);
    }

    const nuevoUsuario = new this.model(usuario);
    return await nuevoUsuario.save();
  }

  async saveAll(usuarios) {
    return await this.model.insertMany(usuarios);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    return await this.model.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }
}

export const usuarioRepository = new UsuarioRepository();

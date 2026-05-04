
export class UsuarioRepository {
  constructor() {
    this.usuarios = {};
    this.nextId = 1;
  }

  async save(usuario) {
    if (!usuario.id) {
      usuario.id = this.nextId++;
    }
    this.usuarios[usuario.id] = usuario;
    return usuario;
  }

  async findById(id) {
    return this.usuarios[id];
  }

  async modificar(id, datosActualizados) {
    const usuario = await this.findById(id);
    if (usuario) {
      Object.assign(usuario, datosActualizados);
    }
    return usuario;
  }

  async findAll() {
    return Object.values(this.usuarios);
  }

  async eliminar(id) {
    if (this.usuarios[id]) {
      delete this.usuarios[id];
      return true;
    }
    return false;
  }
}

export const usuarioRepository = new UsuarioRepository();
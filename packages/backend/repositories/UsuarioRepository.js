
export class UsuarioRepository {
  constructor() {
    this.usuarios = {};
    this.nextId = 1;
  }

  async save(usuario) {
    const id = this.nextId++;
    usuario.id = id;
    this.usuarios[id] = usuario;
    return usuario;
  }

  async findById(id) {
    return this.usuario[id];
  }

  async modificar(id, datosActualizados) {
    const usuario = await this.obtenerPorId(id);
    if (usuario) {
      Object.assign(usuario, datosActualizados);
    }
    return usuario;
  }

  async obtenerTodos() {
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
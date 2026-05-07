import { BadRequestError, NotFoundError } from "../errors/AppError.js";

export class UsuarioRepository {
  constructor() {
    this.usuarios = {};
    this.nextId = 1;
  }

  async save(usuario) {
    if (!usuario || typeof usuario !== "object") {
      throw new BadRequestError("El usuario es inválido");
    }
    if (!usuario.id) {
      usuario.id = this.nextId++;
    }
    this.usuarios[usuario.id] = usuario;
    return usuario;
  }

  async findById(id) {
    return this.usuarios[id] ?? null;
  }

  async modificar(id, datosActualizados) {
    const usuario = this.usuarios[id];
    if (!usuario) {
      throw new NotFoundError("Usuario no encontrado");
    }
    Object.assign(usuario, datosActualizados);
    return usuario;
  }

  async findAll() {
    return Object.values(this.usuarios);
  }

  async eliminar(id) {
    if (!this.usuarios[id]) {
      throw new NotFoundError("Usuario no encontrado");
    }
    delete this.usuarios[id];
    return true;
  }
}

export const usuarioRepository = new UsuarioRepository();

import { NotFoundError } from '../../errors/AppError.js';
import { UsuarioModel } from '../schemas/UsuarioSchema.js';
import { Usuario } from '../../domain/usuario/Usuario.js';

export class UsuarioRepository {
  fromDB(datos) {
    const usuario = Object.create(Usuario.prototype);
    usuario.id = (datos._id ?? datos.id)?.toString();
    usuario.nombreUsuario = datos.nombreUsuario;
    usuario.email = datos.email;
    usuario.password = datos.password;
    usuario.roles = datos.roles ?? [];
    usuario.dni = datos.dni;
    usuario.nombre = datos.nombre;
    usuario.activo = datos.activo ?? false;
    return usuario;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(usuario) {
    if (usuario._id || usuario.id) {
      const id = usuario._id ?? usuario.id;
      const guardado = await UsuarioModel.findByIdAndUpdate(id, usuario, { new: true }).lean();
      return this.fromDB(guardado);
    } else {
      const nuevo = await UsuarioModel.create(usuario);
      const guardado = await UsuarioModel.findById(nuevo._id).lean();
      return this.fromDB(guardado);
    }
  }

  async saveAll(usuarios) {
    const docs = await UsuarioModel.insertMany(usuarios);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const usuario = await UsuarioModel.findById(id).lean();
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    return this.fromDB(usuario);
  }

  async findByEmail(email) {
    const usuario = await UsuarioModel.findOne({ email: email.toLowerCase().trim() }).lean();
    return usuario ? this.fromDB(usuario) : null;
  }

  async findByNombreUsuario(nombreUsuario) {
    const usuario = await UsuarioModel.findOne({ nombreUsuario: nombreUsuario.trim() }).lean();
    return usuario ? this.fromDB(usuario) : null;
  }

  async findByDni(dni) {
    const usuario = await UsuarioModel.findOne({ dni: dni.trim() }).lean();
    return usuario ? this.fromDB(usuario) : null;
  }

  async findAll() {
    const usuarios = await UsuarioModel.find().lean();
    return this._hidratarColeccion(usuarios);
  }

  async findUsuarioSistema() {
    const usuario = await UsuarioModel.findOne({ roles: 'ADMIN' }).lean();
    if (!usuario) return null;
    return this.fromDB(usuario);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const usuario = await UsuarioModel.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    }).lean();
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    return this.fromDB(usuario);
  }

  // ELIMINAR
  async delete(id) {
    const result = await UsuarioModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Usuario no encontrado');
    return true;
  }

  async deleteAll() {
    await UsuarioModel.deleteMany({});
  }
}

export const usuarioRepository = new UsuarioRepository();

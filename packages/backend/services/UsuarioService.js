import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class UsuarioService {
  constructor({ usuarioRepository: usuarioRepo = usuarioRepository } = {}) {
    this.usuarioRepository = usuarioRepo;
  }

  async findById(id) {
    ValidadorId.validarIds(id);
    return await this.usuarioRepository.findById(id);
  }

  async save(datosUsuario) {
    return await this.usuarioRepository.save(datosUsuario);
  }

  async verificarUsuarioSistema(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    if (usuario.nombreUsuario !== 'SISTEMA') {
      throw new ForbiddenError('Solo el usuario SISTEMA puede realizar esta operación');
    }
    return usuario;
  }
}

export const usuarioService = new UsuarioService();

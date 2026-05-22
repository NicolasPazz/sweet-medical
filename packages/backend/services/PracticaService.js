import { Practica } from '../domain/servicios/Practica.js';
import { practicaRepository } from '../infrastructure/repositories/PracticaRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class PracticaService {
  constructor({
    practicaRepository: practicaRepo = practicaRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
  } = {}) {
    this.practicaRepository = practicaRepo;
    this.usuarioRepository = usuarioRepo;
  }

  async _verificarUsuarioSistema(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) throw new NotFoundError('Usuario no encontrado');
    if (usuario.nombreUsuario !== 'SISTEMA') {
      throw new ForbiddenError('Solo el usuario SISTEMA puede realizar esta operación');
    }
  }

  async obtenerTodos() {
    return await this.practicaRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return practica;
  }

  async agregar(idUsuario, datosPractica) {
    await this._verificarUsuarioSistema(idUsuario);
    const practica = new Practica(
      datosPractica.codigo,
      datosPractica.nombre,
      datosPractica.duracionTurnoEnMins,
      datosPractica.costo,
    );
    return await this.practicaRepository.save(practica);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this._verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this._verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, { activo: false });
  }
}

export const practicaService = new PracticaService();

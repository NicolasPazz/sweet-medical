import { Especialidad } from '../domain/servicios/Especialidad.js';
import { especialidadRepository } from '../infrastructure/repositories/EspecialidadRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class EspecialidadService {
  constructor({
    especialidadRepository: especialidadRepo = especialidadRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
  } = {}) {
    this.especialidadRepository = especialidadRepo;
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
    return await this.especialidadRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return especialidad;
  }

  async agregar(idUsuario, datosEspecialidad) {
    await this._verificarUsuarioSistema(idUsuario);
    const especialidad = new Especialidad(
      datosEspecialidad.nombre,
      datosEspecialidad.duracionTurnoEnMins,
      datosEspecialidad.costo,
    );
    return await this.especialidadRepository.save(especialidad);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this._verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return await this.especialidadRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this._verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return await this.especialidadRepository.update(id, { activo: false });
  }
}

export const especialidadService = new EspecialidadService();

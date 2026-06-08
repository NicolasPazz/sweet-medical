import { Especialidad } from '../domain/servicios/Especialidad.js';
import { especialidadRepository } from '../infrastructure/repositories/EspecialidadRepository.js';
import { usuarioService } from './UsuarioService.js';
import { NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class EspecialidadService {
  constructor({
    especialidadRepository: especialidadRepo = especialidadRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.especialidadRepository = especialidadRepo;
    this.usuarioService = usuarioSvc;
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
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    const especialidad = new Especialidad(
      datosEspecialidad.nombre,
      datosEspecialidad.duracionTurnoEnMins,
      datosEspecialidad.costo,
    );
    return await this.especialidadRepository.save(especialidad);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return await this.especialidadRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const especialidad = await this.especialidadRepository.findById(id);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return await this.especialidadRepository.update(id, { activo: false });
  }
}

export const especialidadService = new EspecialidadService();

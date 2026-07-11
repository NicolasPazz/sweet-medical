import { Especialidad } from '../domain/servicios/Especialidad.js';
import { especialidadRepository } from '../infrastructure/repositories/EspecialidadRepository.js';
import { usuarioService } from './UsuarioService.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { medicoService } from '../services/MedicoService.js';
import { logger } from '../utils/logger.js';

export class EspecialidadService {
  constructor({
    especialidadRepository: especialidadRepo = especialidadRepository,
    usuarioService: usuarioSvc = usuarioService,
    medicoService: medicoSvc = medicoService,
  } = {}) {
    this.especialidadRepository = especialidadRepo;
    this.usuarioService = usuarioSvc;
    this.medicoService = medicoSvc;
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

  async eliminarDeMedico(id_usuario, especialidadId) {
    ValidadorId.validarIds(id_usuario, especialidadId);
    const medico = await this.medicoService.findByIdUsuario(id_usuario);
    if (!medico) throw new NotFoundError('Médico no encontrado');
    const especialidad = await this.especialidadRepository.findById(especialidadId);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return await this.medicoService.eliminarEspecialidadDeMedico(medico._id, especialidadId);
  }

  async agregarAMedico(id_usuario, especialidadId) {
    ValidadorId.validarIds(id_usuario, especialidadId);
    const medico = await this.medicoService.findByIdUsuario(id_usuario);
    if (!medico) throw new NotFoundError('Médico no encontrado');
    const especialidad = await this.especialidadRepository.findById(especialidadId);
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    const yaLaTiene = medico.especialidades.some(
      (e) => e._id?.toString() === especialidadId || e.toString() === especialidadId,
    );
    if (yaLaTiene) throw new ConflictError('El médico ya tiene asignada esa especialidad');
    return await this.medicoService.agregarEspecialidadAMedico(medico._id, especialidadId);
  }

  async obtenerTodosPorMedico(id_usuario) {
    ValidadorId.validarIds(id_usuario);

    const medico = await this.medicoService.findByIdUsuario(id_usuario);

    logger.debug(medico);

    return medico.especialidades;
  }
}

export const especialidadService = new EspecialidadService();

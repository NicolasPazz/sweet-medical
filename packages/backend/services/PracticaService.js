import { Practica } from '../domain/servicios/Practica.js';
import { practicaRepository } from '../infrastructure/repositories/PracticaRepository.js';
import { usuarioService } from './UsuarioService.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { medicoService } from './MedicoService.js';

export class PracticaService {
  constructor({
    practicaRepository: practicaRepo = practicaRepository,
    usuarioService: usuarioSvc = usuarioService,
    medicoService: medicoSvc = medicoService,
  } = {}) {
    this.practicaRepository = practicaRepo;
    this.usuarioService = usuarioSvc;
    this.medicoService = medicoSvc;
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
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    const practica = new Practica(
      datosPractica.codigo,
      datosPractica.nombre,
      datosPractica.duracionTurnoEnMins,
      datosPractica.costo,
    );
    return await this.practicaRepository.save(practica);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, { activo: false });
  }

  async agregarAMedico(id_usuario, practicaId) {
    ValidadorId.validarIds(id_usuario, practicaId);
    const medico = await this.medicoService.findByIdUsuario(id_usuario);
    if (!medico) throw new NotFoundError('Médico no encontrado');
    const practica = await this.practicaRepository.findById(practicaId);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    const yaLaTiene = medico.practicas.some(
      (p) => p._id?.toString() === practicaId || p.toString() === practicaId,
    );
    if (yaLaTiene) throw new ConflictError('El médico ya tiene asignada esa práctica');
    return await this.medicoService.agregarPracticaAMedico(medico._id, practicaId);
  }

  async eliminarDeMedico(id_usuario, practicaId) {
    ValidadorId.validarIds(id_usuario, practicaId);
    const medico = await this.medicoService.findByIdUsuario(id_usuario);
    if (!medico) throw new NotFoundError('Médico no encontrado');
    const practica = await this.practicaRepository.findById(practicaId);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.medicoService.eliminarPracticaDeMedico(medico._id, practicaId);
  }

  async obtenerTodosPorMedico(id_usuario) {
    ValidadorId.validarIds(id_usuario);
    const medico = await this.medicoService.findByIdUsuario(id_usuario);
    if (!medico) throw new NotFoundError('Médico no encontrado');
    return medico.practicas;
  }
}

export const practicaService = new PracticaService();

import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { usuarioService } from './UsuarioService.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';

export class MedicoService {
  constructor({
    medicoRepository: medicoRepo = medicoRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.medicoRepository = medicoRepo;
    this.usuarioService = usuarioSvc;
  }

  async findByDni(dni) {
    return await this.medicoRepository.findByDni(dni);
  }

  async findByUsuarioId(usuarioId) {
    return await this.medicoRepository.findByUsuarioId(usuarioId);
  }

  async findById(id) {
    return await this.medicoRepository.findById(id);
  }

  async findByIdUsuario(usuarioId) {
    return await this.medicoRepository.findByIdUsuario(usuarioId);
  }

  async findAll() {
    return await this.medicoRepository.findAll();
  }

  async save(medico) {
    return await this.medicoRepository.save(medico);
  }

  async leerTodos() {
    return await this.medicoRepository.findAll();
  }

  async actualizarDisponibilidad(id_medico, disponibilidades) {
    const medico = await this.medicoRepository.findById(id_medico);

    if (medico == null) {
      throw new NotFoundError('Medico no encontrado');
    }

    medico.disponibilidades = disponibilidades.map((d) => ({
      ...d,
      diaSemana: d.diaSemana.trim().toUpperCase(),
    }));

    this.medicoRepository.save(medico);

    return medico;
  }

  async eliminarEspecialidadDeMedico(medicoId, especialidadId) {
    return await this.medicoRepository.eliminarEspecialidadDeMedico(medicoId, especialidadId);
  }

  async agregarPracticaAMedico(medicoId, practicaId) {
    return await this.medicoRepository.agregarPracticaAMedico(medicoId, practicaId);
  }

  async eliminarPracticaDeMedico(medicoId, practicaId) {
    return await this.medicoRepository.eliminarPracticaDeMedico(medicoId, practicaId);
  }

  async agregarEspecialidadAMedico(medicoId, especialidadId) {
    return await this.medicoRepository.agregarEspecialidadAMedico(medicoId, especialidadId);
  }

  async crearMedico(data) {
    if (!data?.usuario || !data?.matricula || !data?.nombre) {
      throw new Error('Faltan datos obligatorios para crear el médico (usuario, matricula, nombre)');
    }

    const medicoExistente = await this.medicoRepository.findByMatricula(data.matricula);
    if (medicoExistente) {
      throw new ConflictError(`Ya existe un medico con matricula ${data.matricula}`);
    }

    const usuarioId = data.usuario?._id ?? data.usuario?.id ?? data.usuario;

    const medico = await this.medicoRepository.save({
      usuario: usuarioId,
      matricula: data.matricula,
      nombre: data.nombre,
      especialidades: data.especialidades || [],
      practicas: data.practicas || [],
      sedes: data.sedes || [],
      disponibilidades: [],
    });

    return medico;
  }

}

export const medicoService = new MedicoService();

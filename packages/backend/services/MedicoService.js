import { ConflictError, NotFoundError } from '../errors/AppError.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';

export class MedicoService {
  constructor({
    medicoRepository: medicoRepo = medicoRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
  } = {}) {
    this.medicoRepository = medicoRepo;
    this.usuarioRepository = usuarioRepo;
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

  async crearMedico(data) {
    if (!data?.usuario || !data?.matricula || !data?.nombre) {
      throw new Error('Faltan datos obligatorios para crear el médico');
    }

    const medicoExistente = await this.medicoRepository.findByMatricula(data.matricula);
    if (medicoExistente) {
      throw new ConflictError(`Ya existe un medico con matricula ${data.matricula}`);
    }

    const usuario = await this.usuarioRepository.save({
      nombreUsuario: data.usuario.nombreUsuario,
      contrasena: data.usuario.contrasena,
      email: data.usuario.email,
      roles: ['MEDICO'],
    });

    const medico = await this.medicoRepository.crear({
      usuario: usuario._id,
      matricula: data.matricula,
      nombre: data.nombre,
      especialidades: data.especialidades || [],
      practicas: data.practicas || [],
      sedes: data.sedes || [],
      disponibilidades: [],
      turnosActualesYFuturos: [],
    });

    return medico;
  }
}

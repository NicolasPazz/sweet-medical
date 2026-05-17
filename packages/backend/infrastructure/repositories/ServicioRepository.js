import { NotFoundError } from '../../errors/AppError.js';
import { especialidadRepository } from './EspecialidadRepository.js';
import { practicaRepository } from './PracticaRepository.js';

export class ServicioRepository {
  constructor() {
    this.especialidadRepository = especialidadRepository;
    this.practicaRepository = practicaRepository;
  }

  // CREAR
  async save(servicio, servicioTipo) {
    const tipo = servicioTipo?.toUpperCase();

    if (tipo === 'ESPECIALIDAD') {
      return await this.especialidadRepository.save(servicio);
    }
    if (tipo === 'PRACTICA') {
      return await this.practicaRepository.save(servicio);
    }

    throw new Error('Tipo de servicio inválido. Debe ser ESPECIALIDAD o PRACTICA.');
  }

  // LEER
  async findById(id) {
    try {
      return await this.especialidadRepository.findById(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    try {
      return await this.practicaRepository.findById(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    throw new NotFoundError('Servicio no encontrado');
  }

  async findAll() {
    const [specialties, practices] = await Promise.all([
      this.especialidadRepository.findAll(),
      this.practicaRepository.findAll(),
    ]);

    return [...specialties, ...practices];
  }

  async update(id, updatedData) {
    try {
      return await this.especialidadRepository.update(id, updatedData);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    try {
      return await this.practicaRepository.update(id, updatedData);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    throw new NotFoundError('Servicio no encontrado');
  }

  // ELIMINAR
  async delete(id) {
    try {
      return await this.especialidadRepository.delete(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    try {
      return await this.practicaRepository.delete(id);
    } catch (error) {
      if (!(error instanceof NotFoundError)) throw error;
    }

    throw new NotFoundError('Servicio no encontrado');
  }
}

export const servicioRepository = new ServicioRepository();

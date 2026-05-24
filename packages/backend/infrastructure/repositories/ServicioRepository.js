import { NotFoundError } from '../../errors/AppError.js';
import { logger } from '../../utils/logger.js';
import { especialidadRepository } from './EspecialidadRepository.js';
import { practicaRepository } from './PracticaRepository.js';

export class ServicioRepository {
  constructor() {
    this.especialidadRepository = especialidadRepository;
    this.practicaRepository = practicaRepository;
  }

  // LEER
  async findById(id) {
    const especialidad = await this.especialidadRepository.findById(id);
    if (especialidad) {
      return especialidad;
    }
    const practica = await this.practicaRepository.findById(id);
    if (practica) return practica;

    throw new NotFoundError('Servicio no encontrado');
  }

  async findByIdAndTipoServicio(id, tipoServicio) {
    if (tipoServicio === 'ESPECIALIDAD') return await this.especialidadRepository.findById(id);
    if (tipoServicio === 'PRACTICA') return await this.practicaRepository.findById(id);
    
    try {
      return await this.findById(id);
    } catch (e) {
      throw new NotFoundError('Servicio no encontrado');
    }
  }

  async findAll() {
    const [specialties, practices] = await Promise.all([
      this.especialidadRepository.findAll(),
      this.practicaRepository.findAll(),
    ]);

    return [...specialties, ...practices];
  }

  // CREAR
  async save(servicio) {
    const esPractica = servicio.codigo !== undefined;

    if (esPractica) {
      return await this.practicaRepository.save(servicio);
    }
    return await this.especialidadRepository.save(servicio);
  }

  // ACTUALIZAR
  async updateEspecialidad(id, updatedData) {
    logger.debug('VOY A UPDATEAAAR');
    return await this.especialidadRepository.update(id, updatedData);
  }

  async updatePractica(id, updatedData) {
    logger.debug('VOY A UPDATEAAAR');
    return await this.practicaRepository.update(id, updatedData);
  }

  // ELIMINAR
  async delete(id, tipoServicio) {
    if (tipoServicio == 'ESPECIALIDAD') {
      const especialidad = await this.especialidadRepository.delete(id);
      if (especialidad) return especialidad;
    } else if (tipoServicio == 'PRACTICA') {
      const practica = await this.practicaRepository.delete(id);
      if (practica) return practica;
    }

    throw new NotFoundError('Servicio no encontrado');
  }
}

export const servicioRepository = new ServicioRepository();

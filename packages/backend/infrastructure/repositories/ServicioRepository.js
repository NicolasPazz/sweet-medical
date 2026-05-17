import { NotFoundError } from '../../errors/AppError.js';
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
    if (especialidad) return especialidad;

    const practica = await this.practicaRepository.findById(id);
    if (practica) return practica;

    throw new NotFoundError('Servicio no encontrado');
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
  async update(id, updatedData) {
    const servicioExistente = await this.findById(id);

    const esPractica = servicioExistente.codigo !== undefined;

    if (esPractica) {
      return await this.practicaRepository.update(id, updatedData);
    }
    return await this.especialidadRepository.update(id, updatedData);
  }

  // ELIMINAR
  async delete(id) {
    const especialidad = await this.especialidadRepository.delete(id);
    if (especialidad) return especialidad;

    const practica = await this.practicaRepository.delete(id);
    if (practica) return practica;

    throw new NotFoundError('Servicio no encontrado');
  }
}

export const servicioRepository = new ServicioRepository();

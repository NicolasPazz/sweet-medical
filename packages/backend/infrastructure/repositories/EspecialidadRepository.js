import { NotFoundError } from '../../errors/AppError.js';
import { EspecialidadModel } from '../schemas/EspecialidadSchema.js';

export class EspecialidadRepository {
  // CREAR
  async save(especialidad) {
    if (especialidad._id) {
      return await EspecialidadModel.findByIdAndUpdate(especialidad._id, especialidad);
    } else {
      const nuevaEspecialidad = new EspecialidadModel(especialidad);
      return await nuevaEspecialidad.save();
    }
  }

  async saveAll(especialidades) {
    return await EspecialidadModel.insertMany(especialidades);
  }

  // LEER
  async findById(id) {
    const especialidad = await EspecialidadModel.findById(id);
    if (!especialidad) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return especialidad;
  }

  async findAll() {
    return await EspecialidadModel.find();
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const especialidad = await EspecialidadModel.findByIdAndUpdate(id, datosActualizados);
    if (!especialidad) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return especialidad;
  }

  // ELIMINAR
  async delete(id) {
    const result = await EspecialidadModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return true;
  }

  async deleteAll() {
    return await EspecialidadModel.deleteMany({});
  }
}

export const especialidadRepository = new EspecialidadRepository();

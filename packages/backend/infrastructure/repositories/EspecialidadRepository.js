import { NotFoundError } from '../../errors/AppError.js';
import { EspecialidadModel } from '../schemas/EspecialidadSchema.js';

export class EspecialidadRepository {
  // CREATE
  async save(especialidad) {
    if (especialidad._id) {
      return await EspecialidadModel.findByIdAndUpdate(especialidad._id, especialidad, {
        new: true,
      });
    } else {
      const newEspecialidad = new EspecialidadModel(especialidad);
      return await newEspecialidad.save();
    }
  }

  // READ
  async findById(id) {
    const especialidad = await EspecialidadModel.findById(id);
    if (!especialidad) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return especialidad;
  }

  async findAll() {
    return await EspecialidadModel.find({ activo: true });
  }

  // UPDATE
  async update(id, datosActualizados) {
    const especialidad = await EspecialidadModel.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
    if (!especialidad) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return especialidad;
  }

  // DELETE
  async delete(id) {
    const result = await EspecialidadModel.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!result) {
      throw new NotFoundError('Especialidad no encontrada');
    }
    return true;
  }
}

export const especialidadRepository = new EspecialidadRepository();

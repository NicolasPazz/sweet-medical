import { NotFoundError } from '../../errors/AppError.js';
import { PracticaModel } from '../schemas/PracticaSchema.js';

export class PracticaRepository {
  // CREATE
  async save(practica) {
    if (practica._id) {
      return await PracticaModel.findByIdAndUpdate(practica._id, practica, { new: true });
    } else {
      const newPractica = new PracticaModel(practica);
      return await newPractica.save();
    }
  }

  // READ
  async findById(id) {
    const practica = await PracticaModel.findById(id);
    if (!practica) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return practica;
  }

  async findAll() {
    return await PracticaModel.find({ activo: true });
  }

  // UPDATE
  async update(id, datosActualizados) {
    const practica = await PracticaModel.findByIdAndUpdate(id, datosActualizados, { new: true });
    if (!practica) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return practica;
  }

  // DELETE
  async delete(id) {
    const result = await PracticaModel.findByIdAndUpdate(id, { activo: false }, { new: true });
    if (!result) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return true;
  }
}

export const practicaRepository = new PracticaRepository();

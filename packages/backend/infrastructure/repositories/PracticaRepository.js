import { NotFoundError } from '../../errors/AppError.js';
import { PracticaModel } from '../schemas/PracticaSchema.js';

export class PracticaRepository {
  // CREAR
  async save(practica) {
    if (practica._id) {
      return await PracticaModel.findByIdAndUpdate(practica._id, practica);
    } else {
      const nuevaPractica = new PracticaModel(practica);
      return await nuevaPractica.save();
    }
  }

  async saveAll(practicas) {
    return await PracticaModel.insertMany(practicas);
  }

  // LEER
  async findById(id) {
    const practica = await PracticaModel.findById(id);
    if (!practica) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return practica;
  }

  async findAll() {
    return await PracticaModel.find();
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const practica = await PracticaModel.findByIdAndUpdate(id, datosActualizados);
    if (!practica) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return practica;
  }

  // ELIMINAR
  async delete(id) {
    const result = await PracticaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Práctica no encontrada');
    }
    return true;
  }

  async deleteAll() {
    await PracticaModel.deleteMany({});
  }
}

export const practicaRepository = new PracticaRepository();

import { NotFoundError } from '../../errors/AppError.js';
import { SedeModel } from '../schemas/SedeSchema.js';

export class SedeRepository {
  // CREAR
  async save(sede) {
    if (sede._id) {
      return await SedeModel.findByIdAndUpdate(sede._id, sede, { new: true });
    } else {
      const newSede = new SedeModel(sede);
      return await newSede.save();
    }
  }

  async saveAll(sedes) {
    return await SedeModel.insertMany(sedes);
  }

  // LEER
  async findById(id) {
    const sede = await SedeModel.findById(id);
    if (!sede) {
      throw new NotFoundError('Sede no encontrada');
    }
    return sede;
  }

  async findAll() {
    return await SedeModel.find();
  }

  // ACTUALIZAR

  // ELIMINAR
  async delete(id) {
    const result = await SedeModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Sede no encontrada');
    }
    return true;
  }

  async deleteAll() {
    return await SedeModel.deleteMany({});
  }
}

export const sedeRepository = new SedeRepository();

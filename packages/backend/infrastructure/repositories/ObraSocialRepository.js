import { NotFoundError } from '../../errors/AppError.js';
import { ObraSocialModel } from '../schemas/ObraSocialSchema.js';

export class ObraSocialRepository {
  // CREAR
  async save(obraSocial) {
    if (obraSocial._id) {
      return await ObraSocialModel.findByIdAndUpdate(obraSocial._id, obraSocial, { new: true });
    } else {
      const newObraSocial = new ObraSocialModel(obraSocial);
      return await newObraSocial.save();
    }
  }

  async saveAll(obrasSociales) {
    return await ObraSocialModel.insertMany(obrasSociales);
  }

  // LEER
  async findById(id) {
    const obraSocial = await ObraSocialModel.findById(id);
    if (!obraSocial) {
      throw new NotFoundError('Obra social no encontrada');
    }
    return obraSocial;
  }

  async findAll() {
    return await ObraSocialModel.find();
  }

  // ACTUALIZAR
  // No hay método update definido

  // ELIMINAR
  async delete(id) {
    const result = await ObraSocialModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Obra social no encontrada');
    }
    return true;
  }

  async deleteAll() {
    return await ObraSocialModel.deleteMany({});
  }
}

export const obraSocialRepository = new ObraSocialRepository();

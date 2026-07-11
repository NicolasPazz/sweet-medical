import { ObraSocialModel } from '../schemas/ObraSocialSchema.js';

export class ObraSocialRepository {
  constructor() {
    this.model = ObraSocialModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  // CREAR
  async save(obraSocial) {
    const id = obraSocial.id || obraSocial._id;

    if (id) {
      return await this.update(id, obraSocial);
    }

    const nuevaObraSocial = new this.model(obraSocial);
    return await nuevaObraSocial.save();
  }

  async saveAll(obrasSociales) {
    return await this.model.insertMany(obrasSociales);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    return await this.model.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }
}

export const obraSocialRepository = new ObraSocialRepository();

import { SedeModel } from '../schemas/SedeSchema.js';

export class SedeRepository {
  constructor() {
    this.model = SedeModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  // CREAR
  async save(sede) {
    const id = sede.id || sede._id;

    if (id) {
      return await this.update(id, sede);
    }

    const nuevaSede = new this.model(sede);
    return await nuevaSede.save();
  }

  async saveAll(sedes) {
    return await this.model.insertMany(sedes);
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

export const sedeRepository = new SedeRepository();

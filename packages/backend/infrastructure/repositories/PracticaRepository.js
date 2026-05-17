import { PracticaModel } from '../schemas/PracticaSchema.js';

export class PracticaRepository {
  constructor() {
    this.model = PracticaModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  // CREAR
  async save(practica) {
    const id = practica.id || practica._id;

    if (id) {
      return await this.update(id, practica);
    }

    const nuevaPractica = new this.model(practica);
    return await nuevaPractica.save();
  }

  async saveAll(practicas) {
    return await this.model.insertMany(practicas);
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

export const practicaRepository = new PracticaRepository();

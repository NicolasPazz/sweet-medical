import { EspecialidadModel } from '../schemas/EspecialidadSchema.js';

export class EspecialidadRepository {
  constructor() {
    this.model = EspecialidadModel;
  }

  // LEER
  async findAll() {
    return await this.model.find({ activo: true });
  }

  async findById(id) {
    return await this.model.findOne({ _id: id, activo: true });
  }

  // CREAR
  async save(especialidad) {
    const id = especialidad.id || especialidad._id;

    if (id) {
      return await this.update(id, especialidad);
    }

    const nuevaEspecialidad = new this.model(especialidad);
    return await nuevaEspecialidad.save();
  }

  async saveAll(especialidades) {
    return await this.model.insertMany(especialidades);
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

export const especialidadRepository = new EspecialidadRepository();

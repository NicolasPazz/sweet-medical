import { PlanModel } from '../schemas/PlanSchema.js';

export class PlanRepository {
  constructor() {
    this.model = PlanModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  // CREAR
  async save(plan) {
    const id = plan.id || plan._id;

    if (id) {
      return await this.update(id, plan);
    }

    const nuevoPlan = new this.model(plan);
    return await nuevoPlan.save();
  }

  async saveAll(planes) {
    return await this.model.insertMany(planes);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    return await this.model.findByIdAndUpdate(id, datosActualizados, {
      new: true,
    });
  }

  // ELIMINAR
  async deleteAll() {
    await this.model.deleteMany({});
  }
}

export const planRepository = new PlanRepository();

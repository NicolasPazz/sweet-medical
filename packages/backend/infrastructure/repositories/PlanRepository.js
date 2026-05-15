import { NotFoundError } from '../../errors/AppError.js';
import { PlanModel } from '../schemas/PlanSchema.js';

export class PlanRepository {
  // CREAR
  async save(plan) {
    if (plan._id) {
      return await PlanModel.findByIdAndUpdate(plan._id, plan, { new: true });
    } else {
      const newPlan = new PlanModel(plan);
      const savedPlan = await newPlan.save();
      return savedPlan;
    }
  }

  async saveAll(planes) {
    return await PlanModel.insertMany(planes);
  }

  // LEER
  async findById(id) {
    const plan = await PlanModel.findById(id);
    if (!plan) {
      throw new NotFoundError('Plan no encontrado');
    }
    return plan;
  }

  async findAll() {
    return await PlanModel.find();
  }

  // ACTUALIZAR

  // ELIMINAR
  async delete(id) {
    const result = await PlanModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Plan no encontrado');
    }
    return true;
  }

  async deleteAll() {
    return await PlanModel.deleteMany({});
  }
}

export const planRepository = new PlanRepository();

import { NotFoundError } from '../../errors/AppError.js';
import { PlanModel } from '../schemas/PlanSchema.js';

export class PlanRepository {
  // CREATE
  async save(plan) {
    if (plan._id) {
      return await PlanModel.findByIdAndUpdate(plan._id, plan, { new: true });
    } else {
      const newPlan = new PlanModel(plan);
      const savedPlan = await newPlan.save();
      return savedPlan;
    }
  }

  // READ
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

  // UPDATE
  // No hay método update definido

  // DELETE
  async delete(id) {
    const result = await PlanModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Plan no encontrado');
    }
    return true;
  }
}

export const planRepository = new PlanRepository();

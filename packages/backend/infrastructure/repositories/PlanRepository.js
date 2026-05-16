import { NotFoundError } from '../../errors/AppError.js';
import { PlanModel } from '../schemas/PlanSchema.js';
import { Plan } from '../../domain/cobertura/Plan.js';

export class PlanRepository {

  fromDB(datos) {
    const plan = Object.create(Plan.prototype);
    plan.id = datos._id ?? datos.id;
    plan.nombre = datos.nombre;
    plan.coberturasEspecialidad = datos.coberturasEspecialidad ?? [];
    plan.coberturasPractica = datos.coberturasPractica ?? [];
    return plan;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(plan) {
    if (plan._id || plan.id) {
      const id = plan._id ?? plan.id;
      const guardado = await PlanModel.findByIdAndUpdate(id, plan, { new: true }).lean();
      return this.fromDB(guardado);
    } else {
      const nuevo = await PlanModel.create(plan);
      const guardado = await PlanModel.findById(nuevo._id).lean();
      return this.fromDB(guardado);
    }
  }

  async saveAll(planes) {
    const docs = await PlanModel.insertMany(planes);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const plan = await PlanModel.findById(id).lean();
    if (!plan) throw new NotFoundError('Plan no encontrado');
    return this.fromDB(plan);
  }

  async findAll() {
    const planes = await PlanModel.find().lean();
    return this._hidratarColeccion(planes);
  }

  // ELIMINAR
  async delete(id) {
    const result = await PlanModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Plan no encontrado');
    return true;
  }

  async deleteAll() {
    await PlanModel.deleteMany({});
  }
}

export const planRepository = new PlanRepository();

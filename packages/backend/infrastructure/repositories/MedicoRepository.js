import { MedicoModel } from '../models/MedicoModel.js';
import { ConflictError, NotFoundError } from '../../errors/AppError.js';

export class MedicoRepository {
  async crear(data) {
      const medico = await MedicoModel.create(data);
      return medico;
  }

  async findById(id) {
    const medico = await MedicoModel.findById(id)
      .populate("usuario")
      .populate("especialidades")
      .populate("practicas")
      .populate("sedes")
      .populate("turnosActualesYFuturos");

    if (!medico) {
      throw new NotFoundError("Médico no encontrado");
    }

    return medico;
  }

  async findByMatricula(matricula) {
    return await MedicoModel.findOne({ matricula });
  }

  async findAll() {
    return await MedicoModel.find()
      .populate("usuario")
      .populate("especialidades")
      .populate("practicas")
      .populate("sedes")
      .populate("turnosActualesYFuturos");
  }

  async modificar(id, data) {
    const medico = await MedicoModel.findByIdAndUpdate(id, data, {
      new: true,
    });

    if (!medico) {
      throw new NotFoundError("Médico no encontrado");
    }

    return medico;
  }

  async eliminar(id) {
    const medico = await MedicoModel.findByIdAndDelete(id);

    if (!medico) {
      throw new NotFoundError("Médico no encontrado");
    }

    return true;
  }
}
export const medicoRepository = new MedicoRepository();
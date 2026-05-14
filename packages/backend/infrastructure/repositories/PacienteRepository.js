import { NotFoundError } from '../../errors/AppError.js';
import { PacienteModel } from '../schemas/PacienteSchema.js';

export class PacienteRepository {
  // CREATE
  async save(paciente) {
    if (paciente._id) {
      return await PacienteModel.findByIdAndUpdate(paciente._id, paciente, { new: true })
        .populate('usuario')
        .populate('obraSocial')
        .populate('plan');
    } else {
      const newPaciente = new PacienteModel(paciente);
      const savedPaciente = await newPaciente.save();
      await savedPaciente.populate('usuario');
      return savedPaciente;
    }
  }

  // READ
  async findById(id) {
    const paciente = await PacienteModel.findById(id)
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan');
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }
    return paciente;
  }

  async findAll() {
    return await PacienteModel.find().populate('usuario').populate('obraSocial').populate('plan');
  }

  // UPDATE
  async update(id, datosActualizados) {
    const paciente = await PacienteModel.findByIdAndUpdate(id, datosActualizados, { new: true })
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan');
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }
    return paciente;
  }

  // DELETE
  async delete(id) {
    const result = await PacienteModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Paciente no encontrado');
    }
    return true;
  }
}

export const pacienteRepository = new PacienteRepository();

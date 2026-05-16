import { NotFoundError } from '../../errors/AppError.js';
import { PacienteModel } from '../schemas/PacienteSchema.js';

export class PacienteRepository {
  // CREAR
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

  async saveAll(pacientes) {
    return await PacienteModel.insertMany(pacientes);
  }

  // LEER
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

    async findByIdUsuario(usuarioId) {
    const paciente = await PacienteModel.findOne({ usuario: usuarioId })
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();

    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return paciente;
  }

  async findAll() {
    return await PacienteModel.find()
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();
  }

  // ACTUALIZAR
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

  // ELIMINAR
  async delete(id) {
    const result = await PacienteModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Paciente no encontrado');
    }
    return true;
  }

  async deleteAll() {
    return await PacienteModel.deleteMany({});
  }
}

export const pacienteRepository = new PacienteRepository();

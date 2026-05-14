import { NotFoundError } from '../../errors/AppError.js';
import { MedicoModel } from '../schemas/MedicoSchema.js';

export class MedicoRepository {
  // CREATE
  async save(medico) {
    if (medico._id) {
      return await MedicoModel.findByIdAndUpdate(medico._id, medico, { new: true })
        .populate('usuario')
        .populate('especialidades')
        .populate('practicas')
        .populate('sedes')
        .populate('turnosActualesYFuturos');
    } else {
      const newMedico = new MedicoModel(medico);
      const savedMedico = await newMedico.save();
      await savedMedico.populate('usuario');
      return savedMedico;
    }
  }

  // READ
  async findById(id) {
    const medico = await MedicoModel.findById(id)
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos');
    if (!medico) {
      throw new NotFoundError('Médico no encontrado');
    }
    return medico;
  }

  async findAll() {
    return await MedicoModel.find()
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos');
  }

  // UPDATE
  async update(id, datosActualizados) {
    const medico = await MedicoModel.findByIdAndUpdate(id, datosActualizados, { new: true })
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos');
    if (!medico) {
      throw new NotFoundError('Médico no encontrado');
    }
    return medico;
  }

  // DELETE
  async delete(id) {
    const result = await MedicoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Médico no encontrado');
    }
    return true;
  }
}

export const medicoRepository = new MedicoRepository();

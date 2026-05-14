import { NotFoundError } from '../../errors/AppError.js';
import { TurnoModel } from '../schemas/TurnoSchema.js';

export class TurnoRepository {
  // CREATE
  async save(turno) {
    if (turno._id) {
      return await TurnoModel.findByIdAndUpdate(turno._id, turno, { new: true });
    } else {
      const newTurno = new TurnoModel(turno);
      return await newTurno.save();
    }
  }

  // READ
  async findById(id) {
    const turno = await TurnoModel.findById(id).populate('medico').populate('paciente');
    if (!turno) {
      throw new NotFoundError('Turno no encontrado');
    }
    return turno;
  }

  async findAll() {
    return await TurnoModel.find().populate('medico').populate('paciente');
  }

  async findAllByMedicId(medicId) {
    return await TurnoModel.find({ medico: medicId }).populate('paciente');
  }

  async findAllByPatientId(pacienteId) {
    return await TurnoModel.find({ paciente: pacienteId }).populate('medico');
  }

  // UPDATE
  async update(id, datosActualizados) {
    const turno = await TurnoModel.findByIdAndUpdate(id, datosActualizados, { new: true });
    if (!turno) {
      throw new NotFoundError('Turno no encontrado');
    }
    return turno;
  }

  // DELETE
  async delete(id) {
    const result = await TurnoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Turno no encontrado');
    }
    return true;
  }
}

export const turnoRepository = new TurnoRepository();

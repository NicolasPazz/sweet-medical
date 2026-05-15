import { NotFoundError } from '../../errors/AppError.js';
import { TurnoModel } from '../schemas/TurnoSchema.js';

export class TurnoRepository {
  // CREAR
  async save(turno) {
    if (turno._id) {
      return await TurnoModel.findByIdAndUpdate(turno._id, turno, { new: true });
    } else {
      const newTurno = new TurnoModel(turno);
      return await newTurno.save();
    }
  }

  async saveAll(turnos) {
    return await TurnoModel.insertMany(turnos);
  }

  // LEER
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

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const turno = await TurnoModel.findByIdAndUpdate(id, datosActualizados, { new: true });
    if (!turno) {
      throw new NotFoundError('Turno no encontrado');
    }
    return turno;
  }

  // ELIMINAR
  async delete(id) {
    const result = await TurnoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Turno no encontrado');
    }
    return true;
  }

  async deleteAll() {
    await TurnoModel.deleteMany({});
  }
}

export const turnoRepository = new TurnoRepository();

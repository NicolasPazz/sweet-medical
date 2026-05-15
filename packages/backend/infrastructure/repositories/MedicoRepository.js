import { NotFoundError } from '../../errors/AppError.js';
import { MedicoModel } from '../schemas/MedicoSchema.js';

export class MedicoRepository {
  // CREAR
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

  async saveAll(medicos) {
    return await MedicoModel.insertMany(medicos);
  }

  // LEER
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

  async findByMatricula(matricula) {
    return await MedicoModel.findOne({ matricula }).lean();
  }

  async findAll() {
    return await MedicoModel.find()
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
  }

  // ACTUALIZAR
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

  // ELIMINAR
  async delete(id) {
    const result = await MedicoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Médico no encontrado');
    }
    return true;
  }

  async deleteAll() {
    return await MedicoModel.deleteMany({});
  }
}
export const medicoRepository = new MedicoRepository();

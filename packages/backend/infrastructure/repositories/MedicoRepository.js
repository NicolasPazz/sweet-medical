import { NotFoundError } from '../../errors/AppError.js';
import { MedicoModel } from '../schemas/MedicoSchema.js';
import { turnoRepository } from './TurnoRepository.js';

export class MedicoRepository {


  
  _hidratarMedico(medico) {
      if (!medico) return medico;

      if (Array.isArray(medico.turnosActualesYFuturos)) {
        medico.turnosActualesYFuturos = medico.turnosActualesYFuturos.map(turno => {
          if (!turno) return turno;
          
          return turnoRepository._hidratarEstado(turno);
        });
      }

      return medico;
    }

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

async findByIdUsuario(usuarioId) {
    const medico = await MedicoModel.findOne({ usuario: usuarioId })
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean(); 

    if (!medico) {
      throw new NotFoundError('Médico no encontrado');
    }

    return this._hidratarMedico(medico);
  }

  async findByMatricula(matricula) {
    return await MedicoModel.findOne({ matricula }).lean();
  }

async findAll() {
    const medicos = await MedicoModel.find()
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
    return medicos.map(medico => this._hidratarMedico(medico));
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

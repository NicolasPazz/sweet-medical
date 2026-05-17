import { MedicoModel } from '../schemas/MedicoSchema.js';

export class MedicoRepository {
  constructor() {
    this.model = MedicoModel;
  }

  // LEER
  async findAll() {
    return await this.model.find().populate('turnosActualesYFuturos');
  }

  async findById(id) {
    return await this.model.findById(id).populate('turnosActualesYFuturos');
  }

  async findByIdUsuario(usuarioId) {
    return await this.model.findOne({ usuario: usuarioId }).populate('turnosActualesYFuturos');
  }

  async findByMatricula(matricula) {
    return await this.model.findOne({ matricula }).populate('turnosActualesYFuturos');
  }

  // CREAR
  async save(medico) {
    const id = medico.id || medico._id;
    if (id) return await this.update(id, medico);

    const nuevoMedico = new this.model(medico);
    return await nuevoMedico.save();
  }

  async saveAll(medicos) {
    return await this.model.insertMany(medicos);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    return await this.model.findByIdAndUpdate(id, datosActualizados, { new: true });
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }
}

export const medicoRepository = new MedicoRepository();

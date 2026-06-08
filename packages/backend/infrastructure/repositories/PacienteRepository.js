import { PacienteModel } from '../schemas/PacienteSchema.js';

export class PacienteRepository {
  constructor() {
    this.model = PacienteModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findByIdUsuario(usuarioId) {
    return await this.model.findOne({ usuario: usuarioId });
  }

  async findByDniPaciente(pacienteDni) {
    return await this.model.findOne({ dni: pacienteDni });
  }

  // CREAR
  async save(paciente) {
    const id = paciente.id || paciente._id;

    if (id) {
      return await this.update(id, paciente);
    }

    const nuevoPaciente = new this.model(paciente);
    return await nuevoPaciente.save();
  }

  async saveAll(pacientes) {
    return await this.model.insertMany(pacientes);
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

export const pacienteRepository = new PacienteRepository();

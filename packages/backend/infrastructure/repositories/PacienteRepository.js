import { BadRequestError, NotFoundError } from '../../errors/AppError.js';

export class PacienteRepository {
  constructor() {
    this.pacientes = {};
    this.nextId = 1;
  }

  async save(paciente) {
    if (!paciente || typeof paciente !== 'object') {
      throw new BadRequestError('El paciente es inválido');
    }
    if (!paciente.id) {
      paciente.id = this.nextId++;
    }
    this.pacientes[paciente.id] = paciente;
    return paciente;
  }

  async findById(id) {
    return this.pacientes[id] ?? null;
  }

  async modificar(id, datosActualizados) {
    const paciente = this.pacientes[id];
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }
    Object.assign(paciente, datosActualizados);
    return paciente;
  }

  async findAll() {
    return Object.values(this.pacientes);
  }

  async eliminar(id) {
    if (!this.pacientes[id]) {
      throw new NotFoundError('Paciente no encontrado');
    }
    delete this.pacientes[id];
    return true;
  }
}

export const pacienteRepository = new PacienteRepository();

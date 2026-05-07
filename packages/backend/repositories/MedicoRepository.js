import { BadRequestError, NotFoundError } from "../errors/AppError.js";

export class MedicoRepository {
  constructor() {
    this.medicos = {};
    this.nextId = 1;
  }

  async save(medico) {
    if (!medico || typeof medico !== "object") {
      throw new BadRequestError("El médico es inválido");
    }
    if (!medico.id) {
      medico.id = this.nextId++;
    }
    this.medicos[medico.id] = medico;
    return medico;
  }

  async findById(id) {
    return this.medicos[id] ?? null;
  }

  async modificar(id, datosActualizados) {
    const medico = this.medicos[id];
    if (!medico) {
      throw new NotFoundError("Médico no encontrado");
    }
    Object.assign(medico, datosActualizados);
    return medico;
  }

  async findAll() {
    return Object.values(this.medicos);
  }

  async eliminar(id) {
    if (!this.medicos[id]) {
      throw new NotFoundError("Médico no encontrado");
    }
    delete this.medicos[id];
    return true;
  }
}

export const medicoRepository = new MedicoRepository();
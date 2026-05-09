import { BadRequestError, NotFoundError } from "../errors/AppError.js";

export class TurnoRepository {
  constructor() {
    this.turnos = {};
    this.nextId = 1;
  }

  async save(turno) {
    if (!turno || typeof turno !== "object") {
      throw new BadRequestError("El turno es inválido");
    }
    if (!turno.id) {
      turno.id = this.nextId++;
    }
    this.turnos[turno.id] = turno;
    return turno;
  }

  async findById(id) {
    return this.turnos[id] ?? null;
  }

  findAllByMedicId(medicId) {
    return Object.values(this.turnos).filter(
      (turno) => turno.medico && turno.medico.id === medicId
    );
  }

  async obtenerPorPacienteId(pacienteId) {
    return Object.values(this.turnos).filter(
      (turno) => turno.paciente && turno.paciente.id === pacienteId
    );
  }

  async modificar(id, datosActualizados) {
    const turno = this.turnos[id];
    if (!turno) {
      throw new NotFoundError("Turno no encontrado");
    }
    Object.assign(turno, datosActualizados);
    return turno;
  }

  async findAll() {
    return Object.values(this.turnos);
  }

  async eliminar(id) {
    if (!this.turnos[id]) {
      throw new NotFoundError("Turno no encontrado");
    }
    delete this.turnos[id];
    return true;
  }

  async findAllByPatientId(id_paciente) {
    return Object.values(this.turnos).filter(
      (t) => t.paciente && t.paciente.id == id_paciente
    );
  }
}

export const turnoRepository = new TurnoRepository();
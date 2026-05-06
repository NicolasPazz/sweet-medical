
export class TurnoRepository {
  constructor() {
    this.turnos = {};
    this.nextId = 1;
  }

  async save(turno) {
    if (!turno.id) {
      turno.id = this.nextId++;
    }
    this.turnos[turno.id] = turno;
    return turno;
  }

  async findById(id) {
    return this.turnos[id];
  }
  findAllByMedicId(medicId){
    return Object.values(this.turnos).filter(
      (turno) => turno.medico && turno.medico.id === medicId
    );
  }

  async obtenerPorPacienteId(pacienteId) {
    // Buscamos en el objeto de turnos aquellos que pertenezcan al paciente
    return Object.values(this.turnos).filter(
      (turno) => turno.paciente && turno.paciente.id === pacienteId
    );
  }

  async modificar(id, datosActualizados) {
    const turno = await this.obtenerPorId(id);
    if (turno) {
      Object.assign(turno, datosActualizados);
    }
    return turno;
  }

  async findAll() {
    return Object.values(this.turnos);
  }

  async eliminar(id) {
    if (this.turnos[id]) {
      delete this.turnos[id];
      return true;
    }
    return false;
  }

  async findAllByPatientId(id_paciente) {
  // Convert the object values into an array before filtering
  return Object.values(this.turnos).filter(
    (t) => t.paciente && t.paciente.id == id_paciente
  );
}

}

export const turnoRepository = new TurnoRepository();
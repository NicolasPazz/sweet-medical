import { Turno } from "../domain/Turno.js";

export class TurnoRepository {
  constructor() {
    this.turnos = {};
    this.nextId = 1;
  }

  async guardar(turno) {
    const id = this.nextId++;
    turno.id = id;
    this.turnos[id] = turno;
    return turno;
  }

  async obtenerPorId(id) {
    return this.turnos[id];
  }

  async ObtenerPorPacienteId(pacienteId) {
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

  async obtenerTodos() {
    return Object.values(this.turnos);
  }

  async eliminar(id) {
    if (this.turnos[id]) {
      delete this.turnos[id];
      return true;
    }
    return false;
  }
}
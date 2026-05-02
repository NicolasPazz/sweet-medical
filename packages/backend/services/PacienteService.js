import { TurnoRepository } from "../repositories/TurnoRepository.js";

export class PacienteService {
  constructor() {
    this.turnoRepository = new TurnoRepository();
  }

  async getHistorialTurnos(pacienteId) {
    // Aquí podrías agregar lógica adicional, como filtrar por fecha
    // o validar que el paciente existe.
    return await this.turnoRepository.findByPacienteId(pacienteId);
  }
}
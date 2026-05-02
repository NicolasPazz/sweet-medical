import { TurnoRepository } from "../repositories/TurnoRepository.js";

export class PacienteService {
  constructor() {
    this.turnoRepository = new TurnoRepository();
  }

  async getHistorialTurnos(pacienteId) {
    //TODO VALIDACIONES, no se si acá on en el controller, si el paciente existe, etc
    return await this.turnoRepository.obtenerPorPacienteId(pacienteId);
  }
}
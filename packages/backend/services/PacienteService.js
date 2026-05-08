import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { NotFoundError } from "../errors/AppError.js";
import { ValidadorId } from "../domain/utils/ValidadorId.js";

export class PacienteService {
  constructor({
    turnoRepository = new TurnoRepository(),
    pacienteRepository = new PacienteRepository(),
  } = {}) {
    this.turnoRepository = turnoRepository;
    this.pacienteRepository = pacienteRepository;
  }

  async obtenerHistorialTurnos(pacienteId) {
    const id = Number(pacienteId);
    ValidadorId.validarIds(id);

    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) {
      throw new NotFoundError("Paciente no encontrado");
    }

    return this.turnoRepository.obtenerPorPacienteId(id);
  }
}
import { TurnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { PacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { NotFoundError } from '../errors/AppError.js';

export class PacienteService {
  constructor({
    turnoRepository = new TurnoRepository(),
    pacienteRepository = new PacienteRepository(),
  } = {}) {
    this.turnoRepository = turnoRepository;
    this.pacienteRepository = pacienteRepository;
  }

  async obtenerHistorialTurnos(id) {
    const paciente = await this.pacienteRepository.findById(id);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    return this.turnoRepository.findAllByPatientId(id);
  }
}

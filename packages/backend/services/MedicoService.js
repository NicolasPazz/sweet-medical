import { NotFoundError } from '../errors/AppError.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';

export class MedicoService {
  constructor() {
    this.medicoRepository = medicoRepository;
  }

  async actualizarDisponibilidad(id_medico, disponibilidades) {
    const medico = await this.medicoRepository.findById(id_medico);

    if (medico == null) {
      throw new NotFoundError('Medico no encontrado');
    }

    medico.disponibilidades = medico.disponibilidades = disponibilidades.map((d) => ({
      ...d,
      diaSemana: d.diaSemana.trim().toUpperCase(),
    }));

    medicoRepository.save(medico);

    return medico;
  }
}

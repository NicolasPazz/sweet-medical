import { obraSocialRepository } from '../infrastructure/repositories/ObraSocialRepository.js';
import { NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class ObraSocialService {
  constructor({ obraSocialRepository: obraSocialRepo = obraSocialRepository } = {}) {
    this.obraSocialRepository = obraSocialRepo;
  }

  async obtenerTodos() {
    return await this.obraSocialRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const obraSocial = await this.obraSocialRepository.findById(id);
    if (!obraSocial) throw new NotFoundError('Obra social no encontrada');
    return obraSocial;
  }
}

export const obraSocialService = new ObraSocialService();

import { BadRequestError } from '../../errors/AppError.js';

export class ValidadorId {
  static validarIds(...ids) {
    for (const id of ids) {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError('El id no es válido');
      }
    }
  }
}

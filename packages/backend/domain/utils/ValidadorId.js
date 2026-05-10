import { BadRequestError } from '../../errors/AppError.js';
import mongoose from 'mongoose';

export class ValidadorId {
  static validarIds(...ids) {
    for (const id of ids) {
      const esEnteroValido =
        typeof id === 'number' ? Number.isInteger(id) : typeof id === 'string' && /^\d+$/.test(id);

      if (!mongoose.Types.ObjectId.isValid(id) && !esEnteroValido) {
        throw new BadRequestError('El id no es válido');
      }
    }
  }

  static esObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }

  static convertirAObjectId(id) {
    if (!id) return null;

    if (this.esObjectId(id)) {
      return new mongoose.Types.ObjectId(id);
    }

    throw new BadRequestError('El id no puede ser convertido a ObjectId');
  }
}

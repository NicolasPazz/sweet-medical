import { BadRequestError } from '../errors/AppError.js';
import mongoose from 'mongoose';

export class ValidadorId {
  static validarIds(...ids) {
    for (const id of ids) {
      if (!id || !this.esObjectId(id)) {
        throw new BadRequestError(`El ID proporcionado no tiene un formato válido: ${id}`);
      }
    }
  }

  static esObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  }
}

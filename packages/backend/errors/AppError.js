export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? 'error' : 'fail';
    this.timestamp = new Date().toISOString();
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class InvalidIdError extends AppError {
  constructor(id, resource = 'recurso') {
    super(
      `El ID "${id}" es inválido. El identificador debe ser un ObjectId válido de MongoDB para ${resource}.`,
      400,
    );
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

export class DuplicateKeyError extends AppError {
  constructor(field, value) {
    super(`Ya existe ${field} con el valor "${value}". Debe ser único en el sistema.`, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message) {
    super(message, 422);
  }
}

export class InternalServerError extends AppError {
  constructor(resource = 'recurso') {
    super(`Error interno del servidor al procesar ${resource}. Por favor, intente más tarde.`, 500);
  }
}

export class DatabaseError extends AppError {
  constructor(operation, resource, details = '') {
    const detailsMsg = details ? ` Detalles: ${details}` : '';
    super(`Error de base de datos al ${operation} ${resource}.${detailsMsg}`, 500);
  }
}

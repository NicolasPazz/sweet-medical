import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: err.timestamp,
    });
  }

  // Errores 4xx de express.json(): JSON malformado, payload demasiado grande, etc.
  if (err.expose && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({
      status: 'fail',
      message:
        err.type === 'entity.parse.failed'
          ? 'El cuerpo de la solicitud no es un JSON válido'
          : err.message,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
}

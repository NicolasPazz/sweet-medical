import { logger } from '../utils/logger.js';

export function errorLogger(err, req, res, next) {
  logger.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });

  next(err);
}

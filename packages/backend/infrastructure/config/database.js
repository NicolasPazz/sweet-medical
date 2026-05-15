import mongoose from 'mongoose';
import { logger } from '../../utils/logger.js';

export class MongoDBClient {
  static async connect() {
    const { MONGODB_URI, MONGODB_DB_NAME } = process.env;

    if (!MONGODB_URI || !MONGODB_DB_NAME) {
      logger.error(
        'MONGODB_URI y MONGODB_DB_NAME deben estar definidos en las variables de entorno',
      );
      process.exit(1);
    }

    mongoose.connection.on('connected', () => {
      logger.info('[MongoDB] conectado exitosamente.');
    });

    mongoose.connection.on('error', (error) => {
      logger.error(`[MongoDB] error de conexión: ${error.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('[MongoDB] desconectado.');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('[MongoDB] reconectado exitosamente.');
    });

    try {
      const connectionString = `${MONGODB_URI}/${MONGODB_DB_NAME}?authSource=admin`;
      await mongoose.connect(connectionString);

      logger.info(`[MongoDB] conectado a ${mongoose.connection.host}`);
    } catch (error) {
      logger.error(`[MongoDB] error de conexión: ${error.message}`);
      process.exit(1);
    }
  }
}

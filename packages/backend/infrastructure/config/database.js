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
      // Query params armados dinámicamente: `authSource=admin` siempre, y
      // `replicaSet` solo si se definió MONGODB_REPLICA_SET (típicamente para
      // desarrollo local, donde convertimos el mongod standalone en un
      // Replica Set de 1 nodo para poder usar transacciones). En Atlas no
      // hace falta: el replicaSet ya viene indicado en la propia URI
      // `mongodb+srv://...`.
      const queryParams = new URLSearchParams({ authSource: 'admin' });
      if (process.env.MONGODB_REPLICA_SET) {
        queryParams.set('replicaSet', process.env.MONGODB_REPLICA_SET);
      }

      const connectionString = `${MONGODB_URI}/${MONGODB_DB_NAME}?${queryParams.toString()}`;
      await mongoose.connect(connectionString);

      logger.info(`[MongoDB] conectado a ${mongoose.connection.host}`);
    } catch (error) {
      logger.error(`[MongoDB] error de conexión: ${error.message}`);
      process.exit(1);
    }
  }
}

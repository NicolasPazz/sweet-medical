import mongoose from 'mongoose';
import { logger } from '../domain/utils/logger.js';

export class MongoDBClient {
  static async connect() {
    try {
      const conn = await mongoose.connect(
        `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}?authSource=admin`,
      );

      logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
      logger.error(`MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  }
}

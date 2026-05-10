import 'dotenv/config';
import server from './app.js';
import { MongoDBClient } from './infrastructure/config/database.js';
import { logger } from './domain/utils/logger.js';

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await MongoDBClient.connect();

    server.port = PORT;
    server.launch();
  } catch (error) {
    logger.error('Error al iniciar la aplicación:', error);
  }
};

start();

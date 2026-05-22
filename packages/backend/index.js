import 'dotenv/config';
import server from './app.js';
import { MongoDBClient } from './infrastructure/config/database.js';
import { logger } from './utils/logger.js';
import { getPort } from './utils/serverConfig.js';
import { usuarioRepository } from './infrastructure/repositories/UsuarioRepository.js';
import { Usuario } from './domain/usuario/Usuario.js';

const PORT = getPort();

const start = async () => {
  try {
    await MongoDBClient.connect();

    // Cargar el usuario SISTEMA en memoria para que el cronjob lo tenga disponible
    const usuarioSistema = await usuarioRepository.findUsuarioSistema();
    if (usuarioSistema) {
      Usuario.setUsuarioSistema(usuarioSistema);
    } else {
      logger.warn(
        'Usuario SISTEMA no encontrado en BD. Los cronjobs pueden fallar hasta que se corra el seeding.',
      );
    }

    server.port = PORT;
    server.launch();
  } catch (error) {
    logger.error('Error al iniciar la aplicación:', error);
  }
};

start();

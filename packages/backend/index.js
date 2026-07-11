import 'dotenv/config';
import mongoose from 'mongoose';
import server from './app.js';
import { MongoDBClient } from './infrastructure/config/database.js';
import { logger } from './utils/logger.js';
import { getPort } from './utils/serverConfig.js';
import { usuarioRepository } from './infrastructure/repositories/UsuarioRepository.js';
import { Usuario } from './domain/usuario/Usuario.js';
import { PacienteModel } from './infrastructure/schemas/PacienteSchema.js';
import { SeedingController } from './controllers/SeedingController.js';
import { pacienteService } from './services/PacienteService.js';
import { turnoService } from './services/TurnoService.js';

const PORT = getPort();

// --- Shutdown graceful ---------------------------------------------------
// Sin esto, cuando `node --watch` (o nodemon) mata el proceso para
// reiniciarlo tras guardar un archivo, el puerto HTTP y la conexión a
// MongoDB pueden quedar sin liberar del todo. El siguiente arranque falla
// entonces con EADDRINUSE (o la conexión a Mongo queda en un estado raro),
// y el back deja de reflejar cambios hasta que se lo mata y corre a mano.
let cerrando = false;
async function apagarProlijamente(motivo) {
  if (cerrando) return;
  cerrando = true;
  logger.warn(`[Shutdown] Señal recibida (${motivo}). Cerrando servidor y conexión a MongoDB...`);

  try {
    await server.shutdown();
    logger.info('[Shutdown] Servidor HTTP cerrado.');
  } catch (error) {
    logger.error('[Shutdown] Error cerrando el servidor HTTP:', error.message);
  }

  try {
    await mongoose.connection.close();
    logger.info('[Shutdown] Conexión a MongoDB cerrada.');
  } catch (error) {
    logger.error('[Shutdown] Error cerrando la conexión a MongoDB:', error.message);
  }

  process.exit(0);
}

process.on('SIGINT', () => apagarProlijamente('SIGINT'));
process.on('SIGTERM', () => apagarProlijamente('SIGTERM'));

// Si algo async se escapa sin try/catch (ej. un cronjob o una promesa
// suelta), esto evita que el proceso quede "zombie" sin loguear nada:
// lo dejamos morir de forma prolija y con el motivo bien visible, para
// que `node --watch` pueda levantarlo limpio en el próximo restart.
process.on('unhandledRejection', (reason) => {
  logger.error('[FATAL] Promesa rechazada sin capturar:', reason?.stack || reason);
  apagarProlijamente('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  logger.error('[FATAL] Excepción no capturada:', error?.stack || error);
  apagarProlijamente('uncaughtException');
});

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

    // Auto-seed si la base de datos de pacientes está vacía
    try {
      const count = await PacienteModel.countDocuments();
      if (count === 0) {
        logger.info(
          '[Auto-Seed] Base de datos vacía detectada. Cargando pacientes y datos de prueba...',
        );
        const seedingController = new SeedingController();
        const mockReq = {};
        const mockRes = {
          status: () => ({ json: () => {} }),
        };
        const mockNext = (err) => {
          if (err) logger.error('[Auto-Seed] Error durante la carga:', err);
        };
        await seedingController.cargarDatosIniciales(mockReq, mockRes, mockNext);
        logger.info('[Auto-Seed] Carga inicial de datos completada con éxito.');
      }
    } catch (seedErr) {
      logger.error('[Auto-Seed] Error al verificar o cargar datos:', seedErr.message);
    }

    logger.info('[App] Vinculando dependencias cruzadas de servicios...');
    pacienteService.turnoService = turnoService;
    turnoService.pacienteService = pacienteService;

    server.port = PORT;
    server.launch();
  } catch (error) {
    logger.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

start();

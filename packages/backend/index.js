import 'dotenv/config';
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
        logger.info('[Auto-Seed] Base de datos vacía detectada. Cargando pacientes y datos de prueba...');
        const seedingController = new SeedingController();
        const mockReq = {};
        const mockRes = {
          status: () => ({ json: () => {} })
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
  }
};

start();


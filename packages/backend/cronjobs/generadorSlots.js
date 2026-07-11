import cron from 'node-cron';
import { turnoService } from '../services/TurnoService.js';
import { logger } from '../utils/logger.js';

const isTestEnv = process.env.NODE_ENV === 'test';

// Se ejecuta todos los días a las 02:00 AM
if (!isTestEnv) {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Inicio cronjob generación turnos');

      await turnoService.refrescarSlots();
    } catch (error) {
      logger.error('Error en el proceso batch de refresco de turnos:', error);
    }
  });
}

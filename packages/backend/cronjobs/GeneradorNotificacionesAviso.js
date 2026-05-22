import cron from 'node-cron';
import { turnoService } from '../services/TurnoService.js';
import { notificacionService } from '../services/NotificacionService.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { logger } from '../utils/logger.js';

// Todos los días a las 3AM
cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('Inicio cronjob generación de notificaciones de aviso a médicos y pacientes');

    const turnosDeManiana = await turnoService.obtenerTurnosParaManiana();

    if (turnosDeManiana.length === 0) {
      logger.info('No hay turnos para mañana. No se generaron notificaciones.');
      return;
    }

    const usuarioSistema = await usuarioRepository.findUsuarioSistema();
    const cantidad = await notificacionService.generarNotificacionesRecordatorias(
      turnosDeManiana,
      usuarioSistema,
    );

    logger.info(`Cronjob finalizado. Se generaron ${cantidad} notificaciones de recordatorio.`);
  } catch (error) {
    logger.error(
      'Error en la generación de notificaciones de recordatorio a médicos y pacientes:',
      error,
    );
  }
});

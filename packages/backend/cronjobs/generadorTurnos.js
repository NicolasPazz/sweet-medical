import cron from 'node-cron';
import { turnoService } from '../services/TurnoService.js';

// Se ejecuta el día 1 de cada mes a las 02:00 AM
cron.schedule('* * * * *', async () => {
  try {
    console.log('Inicio cronjob');

    await turnoService.refrescarTurnos();
  } catch (error) {
    console.error('Error en el proceso batch de refresco de turnos:', error);
  }
});

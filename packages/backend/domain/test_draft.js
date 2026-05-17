import { GeneradorDisponibilidad } from './agenda/GeneradorDisponibilidad.js';
import { logger } from '../utils/logger.js';

let disponibilidades = [
  { diaSemana: 'Lunes', horaDesde: 2, horaHasta: 4 },
  { diaSemana: 'Lunes', horaDesde: 23, horaHasta: 1 }, // Cruza medianoche
];

const bloqueNuevo = { diaSemana: 'Lunes', horaDesde: 22, horaHasta: 23.5 };

logger.info('LISTA INICIAL: ');

logger.info(disponibilidades);

GeneradorDisponibilidad.actualizarDisponibilidad(bloqueNuevo, disponibilidades);

logger.info('LISTA FINAL: ');

logger.info(disponibilidades);

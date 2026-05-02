import { Router } from 'express';
import { TurnoBusquedaController } from '../controllers/TurnoBusquedaController.js';
import { TurnoBusquedaService } from '../application/services/TurnoBusquedaService.js';
import { BusquedaTurnosRepository } from '../infrastructure/repositories/BusquedaTurnosRepository.js';

const turnoRouter = Router();

const repository = new BusquedaTurnosRepository();
const turnoBusquedaService = new TurnoBusquedaService(repository);

// Endpoint de Búsqueda de Turnos (Entrega 2)
turnoRouter.get('/disponibles', TurnoBusquedaController.crear(turnoBusquedaService));

export { turnoRouter };

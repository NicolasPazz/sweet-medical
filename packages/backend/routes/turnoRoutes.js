import express from 'express';

import { TurnoController } from '../controllers/TurnoController.js';
import { TurnoBusquedaController } from '../controllers/TurnoBusquedaController.js';

import { TurnoBusquedaService } from '../application/services/TurnoBusquedaService.js';

import { BusquedaTurnosRepository } from '../infrastructure/repositories/BusquedaTurnosRepository.js';

import { MotorCostos } from '../domain/cobertura/MotorCostos.js';

const turnoController = new TurnoController();

const repository = new BusquedaTurnosRepository();
const motorCostos = new MotorCostos();

const turnoBusquedaService = new TurnoBusquedaService(repository, motorCostos);

const turnoRouter = express.Router();

turnoRouter
  .route('/paciente/:id_usuario/reserva/:id_turno')
  .patch((req, res, next) => turnoController.reservarTurno(req, res, next));

turnoRouter
  .route('/paciente/:id_usuario/cancelacion/:id_turno')
  .patch((req, res, next) => turnoController.cancelarTurnoPaciente(req, res, next));

turnoRouter
  .route('/medico/:id_usuario/cancelacion/:id_turno')
  .patch((req, res, next) => turnoController.cancelarTurnoMedico(req, res, next));

turnoRouter
  .route('/medico/:id_usuario/historial/:id_paciente')
  .get((req, res, next) => turnoController.obtenerHistorial(req, res, next));

turnoRouter
  .route('/:id_usuario/realizado/:id_turno')
  .patch((req, res, next) => turnoController.finalizarTurno(req, res, next));

turnoRouter
  .route('/:id_usuario/disponibilidad/:id_servicio')
  .get((req, res, next) => turnoController.obtenerDisponibilidad(req, res, next));

turnoRouter
  .route('/:id_medico/all')
  .get((req, res, next) => turnoController.getAllOfMedic(req, res, next));

turnoRouter.route('/all').get((req, res, next) => turnoController.getAll(req, res, next));

// Búsqueda de turnos disponibles
turnoRouter.route('/disponibles').get(TurnoBusquedaController.crear(turnoBusquedaService));

export default turnoRouter;

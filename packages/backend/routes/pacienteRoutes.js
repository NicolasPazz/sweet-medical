import express from 'express';
import { PacienteController } from '../controllers/PacienteController.js';

const pacienteRouter = express.Router();
const pacienteController = new PacienteController();

// El endpoint REST solicitado para el historial
pacienteRouter
  .route('/:id/turnos')
  .get((req, res, next) => pacienteController.obtenerHistorial(req, res, next));
pacienteRouter
  .route('/all')
  .get((req, res, next) => pacienteController.leerPacientes(req, res, next));

export default pacienteRouter;

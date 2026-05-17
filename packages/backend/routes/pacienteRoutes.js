import express from 'express';
import { PacienteController } from '../controllers/PacienteController.js';

const pacienteRouter = express.Router();
const pacienteController = new PacienteController();

pacienteRouter
  .route('/all')
  .get((req, res, next) => pacienteController.leerPacientes(req, res, next));

pacienteRouter
  .route('/:id/turnos')
  .get((req, res, next) => pacienteController.obtenerHistorial(req, res, next));

export default pacienteRouter;

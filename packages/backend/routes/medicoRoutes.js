import express from 'express';
import { MedicoController } from '../controllers/MedicoController.js';

const medicoRouter = express.Router();
const medicoController = new MedicoController();

// El endpoint REST solicitado para el historial
medicoRouter.route('/all').get((req, res, next) => medicoController.leerMedicos(req, res, next));

medicoRouter
  .route('/disponibilidad')
  .patch((req, res, next) => medicoController.actualizarDisponibilidad(req, res, next));

export default medicoRouter;

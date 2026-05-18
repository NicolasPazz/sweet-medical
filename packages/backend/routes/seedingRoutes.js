import express from 'express';
import { SeedingController } from '../controllers/SeedingController.js';

const seedingRouter = express.Router();
const seedingController = new SeedingController();

seedingRouter
  .route('/datos-iniciales')
  .post((req, res, next) => seedingController.cargarDatosIniciales(req, res, next));

seedingRouter
  .route('/proceso-batch')
  .post((req, res, next) => seedingController.correrProcesoBatch(req, res, next));

export default seedingRouter;

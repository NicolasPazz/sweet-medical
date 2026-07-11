import express from 'express';
import { SeedingController } from '../controllers/SeedingController.js';

const seedingRouter = express.Router();
const seedingController = new SeedingController();


seedingRouter
  .route('/datos-iniciales')
  .post((req, res, next) => seedingController.cargarDatosIniciales(req, res, next));

export default seedingRouter;

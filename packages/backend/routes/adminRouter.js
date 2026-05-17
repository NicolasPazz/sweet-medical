import express from 'express';
import { AdminController } from '../controllers/adminController.js';

const adminRouter = express.Router();
const adminController = new AdminController();

adminRouter
  .route('/datos-iniciales')
  .post((req, res, next) => adminController.cargarDatosIniciales(req, res, next));

export default adminRouter;

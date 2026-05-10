import express from 'express';
import { ServicioController } from '../controllers/ServicioController.js';

const servicioController = new ServicioController();

const router = express.Router();

router
  .route('/')
  .get((req, res, next) => servicioController.obtenerTodos(req, res, next))
  .post((req, res, next) => servicioController.agregar(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => servicioController.obtenerPorId(req, res, next))
  .patch((req, res, next) => servicioController.modificar(req, res, next))
  .delete((req, res, next) => servicioController.eliminar(req, res, next));

export default router;

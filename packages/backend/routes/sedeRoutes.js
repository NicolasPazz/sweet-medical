import express from 'express';
import { SedeController } from '../controllers/SedeController.js';
import { basicAuthAdmin } from '../middlewares/basicAuth.js';

const sedeController = new SedeController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => sedeController.obtenerTodos(req, res, next))
  .post(basicAuthAdmin, (req, res, next) => sedeController.agregar(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => sedeController.obtenerPorId(req, res, next))
  .patch(basicAuthAdmin, (req, res, next) => sedeController.modificar(req, res, next))
  .delete(basicAuthAdmin, (req, res, next) => sedeController.eliminar(req, res, next));

export default router;

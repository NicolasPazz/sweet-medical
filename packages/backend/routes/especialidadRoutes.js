import express from 'express';
import { EspecialidadController } from '../controllers/EspecialidadController.js';

const especialidadController = new EspecialidadController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => especialidadController.obtenerTodos(req, res, next))
  .post((req, res, next) => especialidadController.agregar(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => especialidadController.obtenerPorId(req, res, next))
  .patch((req, res, next) => especialidadController.modificar(req, res, next))
  .delete((req, res, next) => especialidadController.eliminar(req, res, next));

router.
  route('/all/:id_usuario')
  .get((req, res, next) => especialidadController.obtenerTodosPorMedico(req, res, next));

export default router;

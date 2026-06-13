import express from 'express';
import { PracticaController } from '../controllers/PracticaController.js';

const practicaController = new PracticaController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => practicaController.obtenerTodos(req, res, next))
  .post((req, res, next) => practicaController.agregar(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => practicaController.obtenerPorId(req, res, next))
  .patch((req, res, next) => practicaController.modificar(req, res, next))
  .delete((req, res, next) => practicaController.eliminar(req, res, next));

router
  .route('/usuario/:id_usuario')
  .post((req, res, next) => practicaController.agregarAMedico(req, res, next))
  .delete((req, res, next) => practicaController.eliminarDeMedico(req, res, next));

router
  .route('/all/:id_usuario')
  .get((req, res, next) => practicaController.obtenerTodosPorMedico(req, res, next));

export default router;

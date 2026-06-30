import express from 'express';
import { PracticaController } from '../controllers/PracticaController.js';
import { basicAuthUser } from '../middlewares/basicAuth.js';

const practicaController = new PracticaController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => practicaController.obtenerTodos(req, res, next))
  .post((req, res, next) => practicaController.agregar(req, res, next));

// Rutas autenticadas por header — DEBEN ir antes de /:id
router
  .route('/me')
  .get(basicAuthUser, (req, res, next) => practicaController.obtenerTodosPorMedicoMe(req, res, next))
  .post(basicAuthUser, (req, res, next) => practicaController.agregarAMedicoMe(req, res, next))
  .delete(basicAuthUser, (req, res, next) => practicaController.eliminarDeMedicoMe(req, res, next));

router
  .route('/all/:id_usuario')
  .get((req, res, next) => practicaController.obtenerTodosPorMedico(req, res, next));

router
  .route('/usuario/:id_usuario')
  .post((req, res, next) => practicaController.agregarAMedico(req, res, next))
  .delete((req, res, next) => practicaController.eliminarDeMedico(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => practicaController.obtenerPorId(req, res, next))
  .patch((req, res, next) => practicaController.modificar(req, res, next))
  .delete((req, res, next) => practicaController.eliminar(req, res, next));

export default router;

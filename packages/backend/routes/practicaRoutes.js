import express from 'express';
import { PracticaController } from '../controllers/PracticaController.js';
import { basicAuthAdmin, basicAuthMedico, basicAuthUser } from '../middlewares/basicAuth.js';

const practicaController = new PracticaController();
const router = express.Router();

router
  .route('/')
  // Que se pueda ver cartilla
  .get((req, res, next) => practicaController.obtenerTodos(req, res, next))
  .post(basicAuthAdmin, (req, res, next) => practicaController.agregar(req, res, next));

// Rutas autenticadas por header — DEBEN ir antes de /:id
router
  .route('/me')
  .get(basicAuthUser, (req, res, next) =>
    practicaController.obtenerTodosPorMedicoMe(req, res, next),
  )
  .post(basicAuthMedico, (req, res, next) => practicaController.agregarAMedicoMe(req, res, next))
  .delete(basicAuthMedico, (req, res, next) =>
    practicaController.eliminarDeMedicoMe(req, res, next),
  );

router
  .route('/all/:id_usuario')
  // Que se pueda ver cartilla
  .get((req, res, next) => practicaController.obtenerTodosPorMedico(req, res, next));

router
  .route('/:id')
  // Que se pueda ver cartilla
  .get((req, res, next) => practicaController.obtenerPorId(req, res, next))
  .patch(basicAuthAdmin, (req, res, next) => practicaController.modificar(req, res, next))
  .delete(basicAuthAdmin, (req, res, next) => practicaController.eliminar(req, res, next));

export default router;

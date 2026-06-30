import express from 'express';
import { EspecialidadController } from '../controllers/EspecialidadController.js';
import { basicAuthAdmin, basicAuthMedico, basicAuthUser } from '../middlewares/basicAuth.js';

const especialidadController = new EspecialidadController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => especialidadController.obtenerTodos(req, res, next))
  .post(basicAuthAdmin, (req, res, next) => especialidadController.agregar(req, res, next));

// Rutas autenticadas por header — DEBEN ir antes de /:id
router
  .route('/me')
  .get(basicAuthUser, (req, res, next) => especialidadController.obtenerTodosPorMedicoMe(req, res, next))
  .post(basicAuthMedico, (req, res, next) => especialidadController.agregarAMedicoMe(req, res, next))
  .delete(basicAuthMedico, (req, res, next) => especialidadController.eliminarDeMedicoMe(req, res, next));

router
  .route('/all/:id_usuario')
  // Que se pueda ver cartilla
  .get((req, res, next) => especialidadController.obtenerTodosPorMedico(req, res, next));

router
  .route('/:id')
  // Que se pueda ver cartilla
  .get((req, res, next) => especialidadController.obtenerPorId(req, res, next))
  .patch(basicAuthAdmin, (req, res, next) => especialidadController.modificar(req, res, next))
  .delete(basicAuthAdmin, (req, res, next) => especialidadController.eliminar(req, res, next));

export default router;

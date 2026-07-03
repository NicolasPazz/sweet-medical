import express from 'express';
import { EspecialidadController } from '../controllers/EspecialidadController.js';
import { basicAuthUser } from '../middlewares/basicAuth.js';

const especialidadController = new EspecialidadController();
const router = express.Router();

router
  .route('/')
  .get((req, res, next) => especialidadController.obtenerTodos(req, res, next))
  .post((req, res, next) => especialidadController.agregar(req, res, next));

// Rutas autenticadas por header — DEBEN ir antes de /:id
router
  .route('/me')
  .get(basicAuthUser, (req, res, next) =>
    especialidadController.obtenerTodosPorMedicoMe(req, res, next),
  )
  .post(basicAuthUser, (req, res, next) => especialidadController.agregarAMedicoMe(req, res, next))
  .delete(basicAuthUser, (req, res, next) =>
    especialidadController.eliminarDeMedicoMe(req, res, next),
  );

router
  .route('/all/:id_usuario')
  .get((req, res, next) => especialidadController.obtenerTodosPorMedico(req, res, next));

router
  .route('/usuario/:id_usuario')
  .post((req, res, next) => especialidadController.agregarAMedico(req, res, next))
  .delete((req, res, next) => especialidadController.eliminarDeMedico(req, res, next));

router
  .route('/:id')
  .get((req, res, next) => especialidadController.obtenerPorId(req, res, next))
  .patch((req, res, next) => especialidadController.modificar(req, res, next))
  .delete((req, res, next) => especialidadController.eliminar(req, res, next));

export default router;

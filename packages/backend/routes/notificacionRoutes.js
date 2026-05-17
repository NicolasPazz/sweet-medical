import express from 'express';
import { NotificacionController } from '../controllers/NotificacionController.js';

const notificacionController = new NotificacionController();
const router = express.Router();

router
  .route('/leidas/:idUsuario')
  .get((req, res, next) => notificacionController.obtenerLeidas(req, res, next));

router
  .route('/no-leidas/:idUsuario')
  .get((req, res, next) => notificacionController.obtenerNoLeidas(req, res, next));

// En un futuro cuando haya login se va a chequear que el único usuario que pueda leer la notificación sea el destinatario
router
  .route('/:id')
  .patch((req, res, next) => notificacionController.marcarComoLeida(req, res, next));

router.route('/').post((req, res, next) => notificacionController.save(req, res, next));

export default router;

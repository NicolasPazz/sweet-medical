import express from "express";
import { NotificacionController } from "../controllers/NotificacionController.js";

const notificacionController = new NotificacionController();

const router = express.Router();

router
  .route("/leidas/:idUsuario")
  .get((req, res) => notificacionController.obtenerLeidas(req, res));

router
  .route("/no-leidas/:idUsuario")
  .get((req, res) => notificacionController.obtenerNoLeidas(req, res));

// En un futuro cuando haya login se va a chequear que el único usuario que pueda leer la notificación sea el destinatario
router.route("/:id").patch((req, res) => notificacionController.marcarComoLeida(req, res));

router.route("/").post((req, res) => notificacionController.guardar(req, res));

export default router;

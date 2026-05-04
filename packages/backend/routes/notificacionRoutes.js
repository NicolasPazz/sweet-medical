import express from "express";
import { NotificacionController } from "../controllers/NotificacionController.js";

const notificacionController = new NotificacionController();

const notificacionRouter = express.Router();

notificacionRouter
  .route("/leidas/:idUsuario")
  .get((req, res) => notificacionController.obtenerLeidas(req, res));

notificacionRouter
  .route("/no-leidas/:idUsuario")
  .get((req, res) => notificacionController.obtenerNoLeidas(req, res));

// En un futuro cuando haya login se va a chequear que el único usuario que pueda leer la notificación sea el destinatario
notificacionRouter.route("/:id").patch((req, res) => notificacionController.marcarComoLeida(req, res));

notificacionRouter.route("/").post((req, res) => notificacionController.guardar(req, res));

export default notificacionRouter;

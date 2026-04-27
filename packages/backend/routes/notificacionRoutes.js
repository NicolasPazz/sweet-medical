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

router.route("/").post((req, res) => notificacionController.guardar(req, res));

export default router;

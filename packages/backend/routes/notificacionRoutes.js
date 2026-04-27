import express from "express";
import { NotificacionController } from "../controllers/NotificacionController.js";

const notificacionController = new NotificacionController();

const router = express.Router();

router.route("/no-leidas/:id").get((req, res) => notificacionController.obtenerNoLeidas(req, res));

router.route("/").post((req, res) => notificacionController.guardar(req, res));

export default router;

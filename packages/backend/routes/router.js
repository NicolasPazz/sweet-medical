import express from "express";
import notificacionRoutes from "./notificacionRoutes.js";

const router = express.Router();

// Configuración de paths bases para cada recurso
router.use("/notificaciones", notificacionRoutes);

export default router;

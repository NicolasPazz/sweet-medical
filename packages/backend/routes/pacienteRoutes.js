import express from "express";
import { PacienteController } from "../controllers/PacienteController.js";

const router = express.Router();
const pacienteController = new PacienteController();

// El endpoint REST solicitado para el historial
router.route("/:id/turnos")
  .get((req, res) => pacienteController.obtenerHistorial(req, res));

export default router;
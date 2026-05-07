import express from "express";
import { PacienteController } from "../controllers/PacienteController.js";

const pacienteRouter = express.Router();
const pacienteController = new PacienteController();

// El endpoint REST solicitado para el historial
pacienteRouter.route("/:id/turnos")
  .get((req, res) => pacienteController.obtenerHistorial(req, res));
pacienteRouter.route("/all")
    .get((req,res) => pacienteController.leerPacientes(req, res));


export default pacienteRouter;
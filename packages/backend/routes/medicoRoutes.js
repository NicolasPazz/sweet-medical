import express from "express";
import { MedicoController } from "../controllers/MedicoController.js";

const medicoRouter = express.Router();

// Se las pasamos al controlador
const medicoController = new MedicoController();

// El endpoint REST solicitado para el historial
medicoRouter.route("/datosIniciales")
  .post((req, res) => medicoController.cargarDatosIniciales(req, res));

medicoRouter.route("/all")
    .get((req,res) => medicoController.leerMedicos(req, res));
  
medicoRouter.route("/disponibilidad")
    .patch((req, res) => medicoController.actualizarDisponibilidad(req, res));


export default medicoRouter;
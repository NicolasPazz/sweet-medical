import express from "express";
import { MedicoController } from "../controllers/MedicoController.js";
import { MedicoRepository } from '../repositories/MedicoRepository.js';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';

const medicoRouter = express.Router();

const usuarioRepo = new UsuarioRepository();
const medicoRepo = new MedicoRepository();

// Se las pasamos al controlador
const medicoController = new MedicoController(
    { usuarioRepository: usuarioRepo }, 
    { medicoRepository: medicoRepo }
);

// El endpoint REST solicitado para el historial
medicoRouter.route("/datosIniciales")
  .post((req, res) => medicoController.cargarDatosIniciales(req, res));

medicoRouter.route("/all")
    .get((req,res) => medicoController.leerDatosIniciales(req, res));

export default medicoRouter;
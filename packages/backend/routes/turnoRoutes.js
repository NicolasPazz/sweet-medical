import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";

const turnoController = new TurnoController();

const turnoRouter = express.Router()

turnoRouter.route('/paciente/reserva')
        .patch((req,res) => turnoController.reservarTurno(req, res));

turnoRouter.route('/paciente/cancelacion')
        .patch((req, res) => turnoController.cancelarTurnoPaciente(req, res));

turnoRouter.route('/medico/cancelacion')
        .patch((req, res) => turnoController.cancelarTurnoMedico(req, res));

turnoRouter.route("/paciente/historial")
        .get((req, res) => turnoController.obtenerHistorial(req, res));

turnoRouter.route("/realizado")
        .patch((req, res) => turnoController.finalizarTurno(req, res));

turnoRouter.route("/disponibilidad")
        .get((req, res) => turnoController.obtenerDisponibilidad(req, res));

export default turnoRouter;
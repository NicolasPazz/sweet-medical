import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";

const turnoController = new TurnoController();

const turnoRouter = express.Router()

turnoRouter.route('/paciente/:id_usuario/reserva/:id_turno')
        .patch((req,res) => turnoController.reservarTurno(req, res));

turnoRouter.route('/paciente/:id_usuario/cancelacion/:id_turno')
        .patch((req, res) => turnoController.cancelarTurnoPaciente(req, res));

turnoRouter.route('/medico/:id_usuario/cancelacion/:id_turno')
        .patch((req, res) => turnoController.cancelarTurnoMedico(req, res));

turnoRouter.route("/medico/:id_usuario/historial/:id_paciente")
        .get((req, res) => turnoController.obtenerHistorial(req, res));

turnoRouter.route("/:id_usuario/realizado/:id_turno")
        .patch((req, res) => turnoController.finalizarTurno(req, res));

turnoRouter.route("/:id_usuario/disponibilidad/:id_servicio")
        .get((req, res) => turnoController.obtenerDisponibilidad(req, res));

export default turnoRouter;
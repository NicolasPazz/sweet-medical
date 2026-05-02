import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";

const turnoController = new TurnoController();

const router = express.Router()

router.route('/paciente/reserva')
        .patch((req,res) => turnoController.reservarTurno(req, res));

router.route('/paciente/cancelacion')
        .patch((req, res) => turnoController.cancelarTurnoPaciente(req, res));

router.route('/medico/cancelacion')
        .patch((req, res) => turnoController.cancelarTurnoMedico(req, res));

router.route("/paciente/historial")
        .get((req, res) => turnoController.obtenerHistorial(req, res));
import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";

const turnoController = new TurnoController();

const router = express.Router()

router.route('/reservar')
        .post((req,res) => turnoController.reservarTurno(req, res));
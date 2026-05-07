import express from "express";
import { TurnoController } from "../controllers/TurnoController.js";

const turnoController = new TurnoController();

const router = express.Router()

router.route('/')
        .get((req,res) => turnoController.findTurnosFiltrados(req, res));
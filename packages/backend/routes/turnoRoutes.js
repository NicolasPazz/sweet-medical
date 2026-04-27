import express from "express";

const turnoController = new TurnoController();

const router = express.Router()

router.route('/')
        .get((req,res) => turnoController.findTurnosFiltrados(req, res));
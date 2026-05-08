import express from "express"
import medicoRouter from "./medicoRoutes.js";
import pacienteRouter from "./pacienteRoutes.js";
import turnoRouter from "./turnoRoutes.js";
import servicioRouter from "./servicioRoutes.js";
import notificacionRouter from "./notificacionRoutes.js";

const router = express.Router();

router.use('/medicos', medicoRouter);
router.use('/pacientes', pacienteRouter);
router.use('/turnos', turnoRouter);
router.use('/servicios', servicioRouter);
router.use('/notificaciones', notificacionRouter);

export default router;

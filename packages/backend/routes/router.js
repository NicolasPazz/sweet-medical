import express from "express"
import medicoRoutes from "./medicoRoutes";
import pacienteRoutes from "./pacienteRoutes";
import turnoRoutes from "./turnoRoutes";
import notificacionRoutes from "./notificacionRoutes";
import servicioRoutes from "./servicioRoutes";

const router = express.Router();

router.use('/medicos', medicoRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/turnos', turnoRoutes);
router.use('/servicios', servicioRoutes);
router.use('/notificaciones', notificacionRoutes);

export default router;
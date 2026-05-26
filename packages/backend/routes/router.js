import express from 'express';
import medicoRouter from './medicoRoutes.js';
import pacienteRouter from './pacienteRoutes.js';
import turnoRouter from './turnoRoutes.js';
import servicioRouter from './servicioRoutes.js';
import especialidadRouter from './especialidadRoutes.js';
import practicaRouter from './practicaRoutes.js';
import notificacionRouter from './notificacionRoutes.js';
import seedingRouter from './seedingRoutes.js';

const router = express.Router();

router.use('/medicos', medicoRouter);
router.use('/pacientes', pacienteRouter);
router.use('/turnos', turnoRouter);
router.use('/servicios', servicioRouter);
router.use('/especialidades', especialidadRouter);
router.use('/practicas', practicaRouter);
router.use('/notificaciones', notificacionRouter);
router.use('/seeding', seedingRouter);

export default router;

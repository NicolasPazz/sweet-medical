import express from 'express';
import medicoRouter from './medicoRoutes.js';
import pacienteRouter from './pacienteRoutes.js';
import turnoRouter from './turnoRoutes.js';
import servicioRouter from './servicioRoutes.js';
import especialidadRouter from './especialidadRoutes.js';
import practicaRouter from './practicaRoutes.js';
import notificacionRouter from './notificacionRoutes.js';
import seedingRouter from './seedingRoutes.js';
import authRouter from './authRouter.js';
import usuarioRouter from './usuarioRoutes.js';
import adminRouter from './adminRoutes.js';
import sedeRouter from './sedeRoutes.js';

const router = express.Router();

router.use('/medicos', medicoRouter);
router.use('/pacientes', pacienteRouter);
router.use('/turnos', turnoRouter);
router.use('/servicios', servicioRouter);
router.use('/especialidades', especialidadRouter);
router.use('/practicas', practicaRouter);
router.use('/notificaciones', notificacionRouter);
router.use('/seeding', seedingRouter);
router.use('/auth', authRouter);
router.use('/usuarios', usuarioRouter);
router.use('/admins', adminRouter);
router.use('/sedes', sedeRouter);

export default router;

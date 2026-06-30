import express from 'express';
import { PacienteController } from '../controllers/PacienteController.js';
import { basicAuthUser } from '../middlewares/basicAuth.js';

const pacienteRouter = express.Router();
const pacienteController = new PacienteController();

/**
 * @swagger
 * /pacientes/all:
 *   get:
 *     summary: Obtener lista de todos los pacientes
 *     description: Retorna una lista completa de todos los pacientes registrados en el sistema con información de obra social y plan
 *     tags:
 *       - Pacientes
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Paciente'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
pacienteRouter
  .route('/all')
  .get((req, res, next) => pacienteController.leerPacientes(req, res, next));

// Historial del paciente autenticado por header
pacienteRouter
  .route('/me/turnos')
  .get(basicAuthUser, (req, res, next) => pacienteController.obtenerHistorialMe(req, res, next));

/**
 * @swagger
 * /pacientes/{id_usuario}/turnos:
 *   get:
 *     summary: Obtener historial de turnos de un paciente
 *     description: Retorna el historial completo de turnos de un paciente específico, incluyendo todos los estados por los que ha pasado cada turno
 *     tags:
 *       - Pacientes
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID único del paciente (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de turnos obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Turno'
 *       400:
 *         description: ID mal formado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
pacienteRouter
  .route('/:id_usuario/turnos')
  .get((req, res, next) => pacienteController.obtenerHistorial(req, res, next));

export default pacienteRouter;

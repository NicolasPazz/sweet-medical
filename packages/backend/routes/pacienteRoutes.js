import express from 'express';
import { PacienteController } from '../controllers/PacienteController.js';
import { basicAuthMedico, basicAuthPaciente, basicAuthUser } from '../middlewares/basicAuth.js';

const pacienteRouter = express.Router();
const pacienteController = new PacienteController();

// Creo que este endpoint ya no se va a usar más
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
  .get(basicAuthPaciente, (req, res, next) => pacienteController.obtenerHistorialMe(req, res, next));

/**
 * @swagger
 * /pacientes/{dni}/turnos:
 *   get:
 *     summary: Obtener historial de turnos de un paciente
 *     description: Retorna los datos del paciente junto con el historial completo de sus turnos, incluyendo todos los estados por los que ha pasado cada turno. Requiere autenticación de un médico.
 *     tags:
 *       - Pacientes
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - name: dni
 *         in: path
 *         required: true
 *         description: DNI del paciente
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
 *                   type: object
 *                   properties:
 *                     paciente:
 *                       type: object
 *                       properties:
 *                         id_usuario:
 *                           type: string
 *                         id_paciente:
 *                           type: string
 *                         nombre:
 *                           type: string
 *                         dni:
 *                           type: string
 *                         obraSocial:
 *                           type: string
 *                         plan:
 *                           type: string
 *                     turnos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Turno'
 *       400:
 *         description: DNI mal formado
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
  .route('/:dni/turnos')
  .get(basicAuthMedico, (req, res, next) => pacienteController.obtenerHistorial(req, res, next));

export default pacienteRouter;

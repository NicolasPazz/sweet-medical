import express from 'express';
import { MedicoController } from '../controllers/MedicoController.js';

const medicoRouter = express.Router();
const medicoController = new MedicoController();

/**
 * @swagger
 * /medicos/all:
 *   get:
 *     summary: Obtener lista de todos los médicos
 *     description: Retorna una lista completa de todos los médicos registrados con sus especialidades, prácticas, disponibilidades y turnos
 *     tags:
 *       - Médicos
 *     responses:
 *       200:
 *         description: Lista de médicos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Medico'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
medicoRouter.route('/all').get((req, res, next) => medicoController.leerMedicos(req, res, next));

/**
 * @swagger
 * /medicos/disponibilidad:
 *   patch:
 *     summary: Actualizar disponibilidad de un médico
 *     description: Actualiza los horarios de disponibilidad de un médico específico. Requiere id_medico válido y lista de disponibilidades
 *     tags:
 *       - Médicos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_medico
 *               - disponibilidades
 *             properties:
 *               id_medico:
 *                 type: string
 *                 description: ID del médico (MongoDB ObjectId válido)
 *               disponibilidades:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Disponibilidad'
 *                 description: Lista de horarios disponibles por día de semana
 *             example:
 *               id_medico: "6a09dd781c91c496abde71f3"
 *               disponibilidades:
 *                 - diaSemana: "LUNES"
 *                   horaDesde: "08:00"
 *                   horaHasta: "12:00"
 *                 - diaSemana: "MIERCOLES"
 *                   horaDesde: "14:00"
 *                   horaHasta: "18:00"
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Disponibilidad actualizada exitosamente"
 *       400:
 *         description: Datos inválidos, ID mal formado, o disponibilidades no válidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "fail"
 *               message: "El ID proporcionado no tiene un formato válido"
 *       404:
 *         description: Médico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
medicoRouter
  .route('/disponibilidad')
  .patch((req, res, next) => medicoController.actualizarDisponibilidad(req, res, next));

export default medicoRouter;

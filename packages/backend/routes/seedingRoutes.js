import express from 'express';
import { SeedingController } from '../controllers/SeedingController.js';

const seedingRouter = express.Router();
const seedingController = new SeedingController();

/**
 * @swagger
 * /seeding/proceso-batch:
 *   post:
 *     summary: Cargar datos iniciales del sistema
 *     description: Carga los datos iniciales de prueba o producción en la base de datos. Este endpoint es típicamente usado para inicializar el sistema con datos de ejemplo (médicos, pacientes, servicios, turnos, etc.).
 *     tags:
 *       - Seeding
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Datos iniciales cargados exitosamente
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
 *                   example: "Datos iniciales cargados exitosamente"
 *                 data:
 *                   type: object
 *                   description: Resumen de datos cargados (cantidad de registros por entidad)
 *       400:
 *         description: Solicitud inválida o datos ya fueron cargados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al cargar datos iniciales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
seedingRouter
  .route('/proceso-batch')
  .post((req, res, next) => seedingController.correrProcesoBatch(req, res, next));


seedingRouter
  .route('/datos-iniciales')
  .post((req, res, next) => seedingController.cargarDatosIniciales(req, res, next));

export default seedingRouter;

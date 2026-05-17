import express from 'express';
import { SeedingController } from '../controllers/SeedingController.js';

const seedingRouter = express.Router();
const seedingController = new SeedingController();

/**
 * @swagger
 * /seeding/datos-iniciales:
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
  .route('/datos-iniciales')
  .post((req, res, next) => seedingController.cargarDatosIniciales(req, res, next));

/**
 * @swagger
 * /seeding/refrescar-turnos:
 *   post:
 *     summary: Ejecutar proceso Batch de Generación de Turnos
 *     description: Fuerza la ejecución manual del proceso asincrónico (Batch) que sincroniza la agenda de los profesionales. Elimina turnos DISPONIBLES obsoletos y genera nuevos turnos DISPONIBLES a futuro en base a los huecos libres y horarios de cada médico.
 *     tags:
 *       - Seeding
 *     responses:
 *       200:
 *         description: Proceso Batch ejecutado y finalizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Proceso batch de turnos ejecutado exitosamente"
 *                 data:
 *                   type: object
 *                   description: Métricas de ejecución del proceso Batch
 *                   example:
 *                     totalMedicos: 12
 *                     procesadosExitosamente: 12
 *                     fallidos: 0
 *       500:
 *         description: Error crítico durante el procesamiento por lotes de la agenda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
seedingRouter
  .route('/refrescar-turnos')
  .post((req, res, next) => seedingController.refrescarTurnos(req, res, next));

export default seedingRouter;

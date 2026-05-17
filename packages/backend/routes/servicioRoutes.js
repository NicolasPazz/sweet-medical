import express from 'express';
import { ServicioController } from '../controllers/ServicioController.js';

const servicioController = new ServicioController();
const router = express.Router();

/**
 * @swagger
 * /servicios:
 *   get:
 *     summary: Obtener todos los servicios
 *     description: Retorna una lista de todos los servicios/especialidades disponibles en el sistema
 *     tags:
 *       - Servicios
 *     responses:
 *       200:
 *         description: Lista de servicios obtenida exitosamente
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
 *                     $ref: '#/components/schemas/Servicio'
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear un nuevo servicio
 *     description: Crea un nuevo servicio/especialidad en el sistema. Requiere autenticación de usuario administrador.
 *     tags:
 *       - Servicios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *               - nombre
 *             properties:
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario administrador (MongoDB ObjectId)
 *               nombre:
 *                 type: string
 *                 description: Nombre del servicio
 *               duracionTurnoEnMins:
 *                 type: integer
 *                 description: Duración del turno en minutos
 *               costo:
 *                 type: integer
 *                 description: Costo del servicio
 *             example:
 *               idUsuario: "6a09dd781c91c496abde71f3"
 *               nombre: "Cardiología"
 *               duracionTurnoEnMins: 30
 *               costo: 7000
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: created
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos o incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router
  .route('/')
  .get((req, res, next) => servicioController.obtenerTodos(req, res, next))
  .post((req, res, next) => servicioController.agregar(req, res, next));

/**
 * @swagger
 * /servicios/{id}:
 *   get:
 *     summary: Obtener un servicio por ID
 *     description: Retorna los detalles de un servicio específico
 *     tags:
 *       - Servicios
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del servicio (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: ID mal formado
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 *   patch:
 *     summary: Actualizar un servicio
 *     description: Actualiza los datos de un servicio específico. Requiere autenticación de usuario administrador.
 *     tags:
 *       - Servicios
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del servicio (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *             properties:
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario administrador
 *               nombre:
 *                 type: string
 *                 description: Nombre del servicio
 *               duracionTurnoEnMins:
 *                 type: integer
 *                 description: Duración del turno en minutos
 *               costo:
 *                 type: integer
 *                 description: Costo del servicio
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Servicio'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar un servicio
 *     description: Elimina un servicio del sistema. Requiere autenticación de usuario administrador.
 *     tags:
 *       - Servicios
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del servicio a eliminar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *             properties:
 *               idUsuario:
 *                 type: string
 *                 description: ID del usuario administrador
 *     responses:
 *       204:
 *         description: Servicio eliminado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router
  .route('/:id')
  .get((req, res, next) => servicioController.obtenerPorId(req, res, next))
  .patch((req, res, next) => servicioController.modificar(req, res, next))
  .delete((req, res, next) => servicioController.eliminar(req, res, next));

export default router;

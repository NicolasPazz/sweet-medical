import express from 'express';
import { NotificacionController } from '../controllers/NotificacionController.js';
import { basicAuthUser } from '../middlewares/basicAuth.js';

const notificacionController = new NotificacionController();
const router = express.Router();

/**
 * @swagger
 * /notificaciones/leidas/{idUsuario}:
 *   get:
 *     summary: Obtener notificaciones leídas
 *     description: Retorna todas las notificaciones ya leídas de un usuario
 *     tags:
 *       - Notificaciones
 *     parameters:
 *       - name: idUsuario
 *         in: path
 *         required: true
 *         description: ID del usuario (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificaciones leídas obtenidas exitosamente
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
 *                     $ref: '#/components/schemas/Notificacion'
 *       400:
 *         description: ID mal formado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router
  .route('/leidas')
  .get(basicAuthUser, (req, res, next) => notificacionController.obtenerLeidas(req, res, next));

/**
 * @swagger
 * /notificaciones/no-leidas/{idUsuario}:
 *   get:
 *     summary: Obtener notificaciones no leídas
 *     description: Retorna todas las notificaciones no leídas de un usuario
 *     tags:
 *       - Notificaciones
 *     parameters:
 *       - name: idUsuario
 *         in: path
 *         required: true
 *         description: ID del usuario (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificaciones no leídas obtenidas exitosamente
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
 *                     $ref: '#/components/schemas/Notificacion'
 *       400:
 *         description: ID mal formado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router
  .route('/no-leidas')
  .get(basicAuthUser, (req, res, next) => notificacionController.obtenerNoLeidas(req, res, next));

/**
 * @swagger
 * /notificaciones/{id_notificacion}/{id_destinatario}:
 *   patch:
 *     summary: Marcar notificación como leída
 *     description: Marca una notificación específica como leída actualizando su estado
 *     tags:
 *       - Notificaciones
 *     parameters:
 *       - name: id_notificacion
 *         in: path
 *         required: true
 *         description: ID de la notificación (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_destinatario
 *         in: path
 *         required: true
 *         description: ID del destinatario/usuario (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Notificacion'
 *       400:
 *         description: IDs mal formados
 *       404:
 *         description: Notificación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router
  .route('/:id_notificacion')
  .patch(basicAuthUser, (req, res, next) => notificacionController.marcarComoLeida(req, res, next));


// NO SÉ COMO MANEJAR ESTE CASO CON EL BASIC AUTH:
/**
 * @swagger
 * /notificaciones:
 *   post:
 *     summary: Crear una nueva notificación
 *     description: Crea una nueva notificación en el sistema para notificar a un usuario específico
 *     tags:
 *       - Notificaciones
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destinatario
 *               - remitente
 *               - mensaje
 *             properties:
 *               destinatario:
 *                 type: string
 *                 description: ID del usuario destinatario (MongoDB ObjectId)
 *               remitente:
 *                 type: string
 *                 description: ID del usuario remitente (MongoDB ObjectId)
 *               mensaje:
 *                 type: string
 *                 description: Contenido del mensaje de la notificación
 *             example:
 *               destinatario: "6a09dd781c91c496abde71c8"
 *               remitente: "6a09dd781c91c496abde71f3"
 *               mensaje: "Tu turno ha sido confirmado para el 20/05/2026 a las 10:00"
 *     responses:
 *       201:
 *         description: Notificación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: created
 *                 data:
 *                   $ref: '#/components/schemas/Notificacion'
 *       400:
 *         description: Datos inválidos o incompletos (IDs mal formados o mensaje vacío)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.route('/').post((req, res, next) => notificacionController.save(req, res, next));

export default router;

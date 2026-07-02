import express from 'express';
import { TurnoController } from '../controllers/TurnoController.js';
import { basicAuthMedico, basicAuthPaciente, basicAuthUser } from '../middlewares/basicAuth.js';

const turnoController = new TurnoController();
const turnoRouter = express.Router();

/**
 * @swagger
 * /turnos/paciente/{id_usuario}/reserva/{id_turno}:
 *   patch:
 *     summary: Reservar un turno como paciente
 *     description: Permite a un paciente reservar un turno disponible. El turno pasa de estado DISPONIBLE a RESERVADO.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del paciente (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno a reservar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno reservado exitosamente
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
 *                   example: "Turno reservado exitosamente"
 *       400:
 *         description: IDs mal formados o turno no disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno o paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/paciente/reserva')
  .patch(basicAuthPaciente, (req, res, next) => turnoController.reservarTurno(req, res, next));

// Rutas autenticadas por header (sin id_usuario en ruta)
turnoRouter
  .route('/me/cancelacion/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.cancelarTurnoMe(req, res, next));

turnoRouter
  .route('/me/confirmar/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.confirmarTurnoMe(req, res, next));

turnoRouter
  .route('/me/realizado/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.finalizarTurnoMe(req, res, next));

turnoRouter
  .route('/me/propuesta-reprogramacion/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.proponerReprogramacionMe(req, res, next));

turnoRouter
  .route('/me/responder-reprogramacion/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.responderReprogramacionMe(req, res, next));

/**
 * @swagger
 * /turnos/paciente/{id_usuario}/cancelacion/{id_turno}:
 *   patch:
 *     summary: Cancelar un turno como paciente
 *     description: Permite a un paciente cancelar un turno que ha reservado. Requiere especificar un motivo en el body.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del paciente (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno a cancelar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la cancelación
 *                 example: "Emergencia laboral"
 *     responses:
 *       200:
 *         description: Turno cancelado exitosamente
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
 *                   example: "Turno cancelado exitosamente"
 *       400:
 *         description: IDs mal formados, motivo faltante, o turno no puede ser cancelado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/paciente/:id_usuario/cancelacion/:id_turno')
  .patch(basicAuthPaciente, (req, res, next) => turnoController.cancelarTurnoPaciente(req, res, next));

/**
 * @swagger
 * /turnos/medico/{id_usuario}/cancelacion/{id_turno}:
 *   patch:
 *     summary: Cancelar un turno como médico
 *     description: Permite a un médico cancelar un turno. Requiere especificar un motivo en el body.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del médico (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno a cancelar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo de la cancelación
 *                 example: "Enfermedad súbita"
 *     responses:
 *       200:
 *         description: Turno cancelado exitosamente
 *       400:
 *         description: IDs mal formados o motivo faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/medico/:id_usuario/cancelacion/:id_turno')
  .patch(basicAuthMedico, (req, res, next) => turnoController.cancelarTurnoMedico(req, res, next));

/**
 * @swagger
 * /turnos/medico/{id_usuario}/confirmar/{id_turno}:
 *   patch:
 *     summary: Confirmar un turno como médico
 *     description: Permite a un médico confirmar un turno reservado. Si es el primer turno del día, es obligatorio mandar la sede por el body para congelarla en el resto de los slots libres de esa fecha. En turnos posteriores del mismo día, el body es opcional y se heredará la sede automáticamente.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del médico (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno a confirmar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       description: ID de la sede (Obligatorio solo en el primer turno del día)
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_sede:
 *                 type: string
 *                 description: ID de la sede donde se realizará la atención (MongoDB ObjectId)
 *                 example: "6a10e90bf6a9c4f70dc4e0c4"
 *     responses:
 *       200:
 *         description: Turno confirmado exitosamente
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
 *                   example: "Turno aceptado exitosamente"
 *       400:
 *         description: IDs mal formados o falta de id_sede en el primer turno del día
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno o médico no encontrado
 *       409:
 *         description: Conflicto con otra sede ya asignada en el día
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/medico/:id_usuario/confirmar/:id_turno')
  .patch(basicAuthMedico, (req, res, next) => turnoController.confirmarTurno(req, res, next));

/**
 * @swagger
 * /turnos/medico/{id_usuario}/historial/{id_paciente}:
 *   get:
 *     summary: Obtener historial de turnos de un paciente (acceso médico)
 *     description: Permite a un médico ver el historial completo de turnos de un paciente específico
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del médico (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_paciente
 *         in: path
 *         required: true
 *         description: ID del paciente (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *         description: IDs mal formados
 *       404:
 *         description: Paciente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/medico/:id_usuario/historial/:dni_paciente')
  .get(basicAuthMedico, (req, res, next) => turnoController.obtenerHistorial(req, res, next));

/**
 * @swagger
 * /turnos/medico/{id_usuario}/slots:
 *   get:
 *     summary: Obtener todos los slots de un médico
 *     description: Retorna todos los slots (unidades de tiempo de la agenda) asociados a un médico específico, independientemente de su estado.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del usuario médico (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slots obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       id_slot:
 *                         type: string
 *                       id_medico:
 *                         type: string
 *                       fecha:
 *                         type: string
 *                         example: "2026-05-20"
 *                       horaInicio:
 *                         type: string
 *                         example: "09:00"
 *                       duracionMins:
 *                         type: number
 *                         example: 30
 *                       estado:
 *                         type: string
 *                         enum: [DISPONIBLE, RESERVADO, OCUPADO]
 *                       id_turno_asociado:
 *                         type: string
 *                         nullable: true
 *       400:
 *         description: ID mal formado
 *       404:
 *         description: Médico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/medico/:id_usuario/slots')
  .get((req, res, next) => turnoController.obtenerSlotsMedico(req, res, next));

/**
 * @swagger
 * /turnos/{id_usuario}/realizado/{id_turno}:
 *   patch:
 *     summary: Marcar turno como realizado
 *     description: Marca un turno como realizado después de que se completó la consulta
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del usuario (médico o paciente) (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno marcado como realizado
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
 *                   example: "Turno finalizado exitosamente"
 *       400:
 *         description: IDs mal formados o turno no puede ser marcado como realizado
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */

turnoRouter
  .route('/:id_usuario/realizado/:id_turno')
  .patch(basicAuthMedico, (req, res, next) => turnoController.finalizarTurno(req, res, next));

/**
 * @swagger
 * /turnos/{id_usuario}/propuesta-reprogramacion/{id_turno}:
 *   patch:
 *     summary: Proponer reprogramación de un turno
 *     description: Permite a un médico o paciente proponer una nueva fecha y hora para reprogramar un turno existente. El turno pasa a estado PENDIENTE_REPROGRAMACION hasta que la otra parte responda.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del usuario que propone la reprogramación (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno a reprogramar (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nueva_fecha
 *             properties:
 *               nueva_fecha:
 *                 type: string
 *                 format: date-time
 *                 description: Nueva fecha y hora propuesta para el turno
 *                 example: "2025-08-15T10:30:00.000Z"
 *               motivo:
 *                 type: string
 *                 description: Motivo de la solicitud de reprogramación
 *                 example: "Conflicto de horario"
 *     responses:
 *       200:
 *         description: Propuesta de reprogramación enviada exitosamente
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
 *                   example: "Propuesta de reprogramación enviada exitosamente"
 *       400:
 *         description: IDs mal formados, fecha inválida, o el turno no puede ser reprogramado en su estado actual
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/:id_usuario/propuesta-reprogramacion/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.proponerReprogramacion(req, res, next));

/**
 * @swagger
 * /turnos/{id_usuario}/responder-reprogramacion/{id_turno}:
 *   patch:
 *     summary: Responder a una propuesta de reprogramación
 *     description: Permite al destinatario de una propuesta de reprogramación aceptarla o rechazarla. Si se acepta, el turno queda reprogramado a la nueva fecha. Si se rechaza, el turno vuelve a su estado anterior.
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del usuario que responde la propuesta (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_turno
 *         in: path
 *         required: true
 *         description: ID del turno con propuesta de reprogramación pendiente (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - aceptar
 *             properties:
 *               aceptar:
 *                 type: boolean
 *                 description: true para aceptar la reprogramación, false para rechazarla
 *                 example: true
 *               motivo:
 *                 type: string
 *                 description: Motivo del rechazo (recomendado si aceptar es false)
 *                 example: "La nueva fecha no me es conveniente"
 *     responses:
 *       200:
 *         description: Respuesta a la reprogramación procesada exitosamente
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
 *                   example: "Reprogramación aceptada exitosamente"
 *       400:
 *         description: IDs mal formados, o el turno no tiene una propuesta de reprogramación pendiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Turno no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/:id_usuario/responder-reprogramacion/:id_turno')
  .patch(basicAuthUser, (req, res, next) => turnoController.responderReprogramacion(req, res, next));

/**
 * @swagger
 * /turnos/{id_usuario}/disponibilidad/{id_servicio}:
 *   get:
 *     summary: Obtener disponibilidad de turnos para un servicio
 *     description: Retorna los turnos disponibles para un servicio/especialidad específica
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del usuario (MongoDB ObjectId)
 *         schema:
 *           type: string
 *       - name: id_servicio
 *         in: path
 *         required: true
 *         description: ID del servicio/especialidad (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida exitosamente
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
 *         description: IDs mal formados
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/:id_usuario/disponibilidad/:id_servicio')
  .get(basicAuthPaciente, (req, res, next) => turnoController.obtenerDisponibilidad(req, res, next));

/**
 * @swagger
 * /turnos/{id_usuario}/all:
 *   get:
 *     summary: Obtener todos los turnos de un médico
 *     description: Retorna todos los turnos asociados a un médico específico
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: id_usuario
 *         in: path
 *         required: true
 *         description: ID del médico (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turnos obtenidos exitosamente
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
 *       404:
 *         description: Médico no encontrado
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter
  .route('/:id_usuario/all')
  .get(basicAuthPaciente, (req, res, next) => turnoController.obtenerTurnosMedico(req, res, next));

// No debería llamarse
/**
 * @swagger
 * /turnos/all:
 *   get:
 *     summary: Obtener todos los turnos del sistema
 *     description: Retorna una lista de todos los turnos registrados en el sistema
 *     tags:
 *       - Turnos
 *     responses:
 *       200:
 *         description: Todos los turnos obtenidos exitosamente
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
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter.route('/all').get((req, res, next) => turnoController.getAll(req, res, next));

/**
 * @swagger
 * /turnos/disponibles:
 *   get:
 *     summary: Buscar turnos disponibles
 *     description: Busca turnos disponibles con filtros de búsqueda avanzada (especialidad, fecha, sede, obra social)
 *     tags:
 *       - Turnos
 *     parameters:
 *       - name: especialidad
 *         in: query
 *         description: Nombre de la especialidad médica a buscar
 *         schema:
 *           type: string
 *           example: "Cardiología"
 *       - name: fecha
 *         in: query
 *         description: Fecha del turno en formato YYYY-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *       - name: sede
 *         in: query
 *         description: Nombre o ID de la sede de atención
 *         schema:
 *           type: string
 *       - name: obra_social
 *         in: query
 *         description: Nombre de la obra social
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turnos disponibles encontrados
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
 *         description: Parámetros de búsqueda inválidos
 *       500:
 *         description: Error interno del servidor
 */
turnoRouter.route('/disponibles').get(basicAuthPaciente, turnoController.buscarTurnos());

turnoRouter.route('/disponibilidad/fechas').get(basicAuthPaciente, turnoController.obtenerFechasDisponibles());

turnoRouter.route('/disponibilidad/horarios').get(basicAuthPaciente, turnoController.obtenerHorariosDisponibles());

export default turnoRouter;

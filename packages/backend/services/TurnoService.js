import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { MedicoRepository } from "../repositories/MedicoRepository.js";
import { Paciente } from "../domain/usuario/Paciente.js";
import { Medico } from "../domain/usuario/Medico.js";
import { Reservado } from "../domain/notificacion/estado-turno/Reservado.js";
import { Cancelado } from "../domain/notificacion/estado-turno/Cancelado.js";
import { Realizado } from "../domain/notificacion/estado-turno/Realizado.js";
import { Agenda } from "../domain/agenda/Agenda.js";
import { Disponible } from "../domain/notificacion/estado-turno/Disponible.js";
import { ConflictError, NotFoundError } from "../errors/AppError.js";

export class TurnoService {

    turnoRepository;
    pacienteRepository;

    constructor({ turnoRepository = new TurnoRepository() } = {}, { notificacionRepository = new NotificacionRepository() } = {}, { usuarioRepository = new UsuarioRepository() } = {}, { medicoRepository = new MedicoRepository() } = {}) {
        this.turnoRepository = turnoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
        this.medicoRepository = medicoRepository;
    }

    reservarTurno(id_usuario, id_turno) {

        const usuario = this.usuarioRepository.findById(id_usuario); // cambiar por usuarioRepository

        if (usuario == null) {
            return { status: 404, data: "Usuario no encontrado" };
        }

        const paciente = usuario.roles.find(r => r instanceof Paciente);

        if (paciente == null) {
            return { status: 404, data: "Paciente no encontrado" };
        }

        const turno = this.turnoRepository.findById(id_turno);

        if (turno == null) {
            return { status: 404, data: "Turno no encontrado" };
        }

        if (!(turno.paciente == paciente)) {
            return { status: 409, data: "El paciente no tiene el turno asignado" };
        }

        if (!(turno.estado instanceof Disponible)) {
            return { status: 409, data: "Turno en estado no disponible" };
        }

        turno.paciente = paciente;

        turno.fechaHora = Agenda.generarFechaHora(turno.fechaHora);

        const notificacion = turno.actualizarEstado(new Reservado, paciente, "Reserva de turno");

        this.notificacionRepository.save(notificacion);
        this.turnoRepository.save(turno);

        return { status: 201 };
    }

    cancelarTurno(id_usuario, id_turno, esMedico, motivo) {
        const usuario = this.usuarioRepository.findById(id_usuario);

        if (usuario == null) {
            return { status: 404, data: "Usuario no encontrado" };
        }

        const turno = this.turnoRepository.findById(id_turno);

        if (turno == null) {
            return { status: 404, data: "Turno no encontrado" };
        }

        if (!(turno.estado instanceof Reservado)) {
            return { status: 409, data: "No se puede cancelar el turno en este estado" };
        }

        if (!esMedico) {
            const paciente = usuario.roles.find(r => r instanceof Paciente);

            if (paciente == null) {
                return { status: 404, data: "Paciente no encontrado" };
            }

            if (!(turno.paciente == paciente)) {
                return { status: 409, data: "El paciente no tiene el turno asignado" };
            }

        } else {

            const medico = usuario.roles.find(r => r instanceof Medico);

            if (medico == null) {
                return { status: 404, data: "Medico no encontrado" };
            }

            if (!(turno.medico == medico)) {
                return { status: 409, data: "El medico no tiene el turno asignado" };
            }

        }

        const unaHoraEnMs = 1000 * 60 * 60;
        if (turno.fechaHora - Date.now() < unaHoraEnMs) {
            return { status: 409, data: "Un turno no puede cancelarse con menos de 1 hora de antelación" };
        }

        const notificacion = turno.actualizarEstado(new Cancelado(), usuario, motivo);

        this.notificacionRepository.save(notificacion);
        this.turnoRepository.save(turno);

        return { status: 201 };
    }

    obtenerHistorial(idPaciente, idUsuarioNum) {
        const usuario = this.usuarioRepository.findById(idUsuarioNum);

        if (usuario == null) {
            return { status: 404, data: "Recurso no encontrado" };
        }

        if (usuario.roles.filter(u => u instanceof Medico).length() == 0) {
            return { status: 403, data: "No sos medico no tenes permiso!!!" };
        }

        const paciente = this.pacienteRepository.findById(idPaciente);

        if (paciente == null) {
            return { status: 404, data: "Recurso no encontrado" };
        }

        const historial = this.turnoRepository.findAllByPatientId(idPaciente);

        return { status: 201, data: historial };
    }

    finalizarTurno(id_usuario, id_turno) {

        const usuario = this.usuarioRepository.findById(id_usuario);

        if (usuario == null) {
            return { status: 404, data: "Usuario no encontrado" };
        }

        if (usuario.roles.filter(u => u instanceof Medico).length() == 0) {
            return { status: 403, data: "No tiene permiso para realizar esta accion, no es medico" };
        }

        const turno = this.turnoRepository.findById(id_turno);

        if (turno == null) {
            throw new NotFoundError("Turno no encontrado");
        }

        const medico = usuario.roles.find(r => r instanceof Medico);

        if (turno.medico !== medico) {
            throw new ConflictError("El turno no pertenece al medico");
        }

        if (turno.estado instanceof Realizado) {
            throw new ConflictError("El turno ya esta realizado");
        }

        turno.actualizarEstado(new Realizado(), usuario, "Turno finalizado");

        this.turnoRepository.save(turno);

        return { status: 201 };
    }

    obtenerDisponibilidad(id_usuario, id_servicio) {

        const usuario = this.usuarioRepository.findById(id_usuario);

        if (usuario == null) {
            return { status: 404, data: "Usuario no encontrado" };
        }

        if (usuario.roles.filter(u => u instanceof Medico).length() == 0) {
            return { status: 403, data: "No tiene permiso para realizar esta accion, no es medico" };
        }

        const medico = usuario.roles.find(r => r instanceof Medico);

        const turnosDelServicio = medico.turnosActualesYFuturos.filter(t => t.servicio.id == id_servicio && t.estado instanceof Disponible);

        return { status: 200, data: turnosDelServicio };
    }

    async refrescarTurnos() {
        const TAMANO_LOTE = 20; // Procesa de a 20 médicos para cuidar la RAM y las conexiones a DB
        const metricas = { procesados: 0, fallidos: 0, total: 0 };

        console.log(`[BATCH START] ${new Date().toISOString()} - Inicio de refresco de turnos.`);

        try {
            // 1. Obtener todos los médicos (si el volumen es masivo, aquí usaríamos paginación)
            const medicos = await this.medicoRepository.findAll();

            metricas.total = medicos?.length || 0;

            if (metricas.total === 0) {
                console.log("[BATCH] No hay médicos para procesar.");
                return;
            }

            // 2. Procesamiento por lotes (Chunks)
            for (let i = 0; i < medicos.length; i += TAMANO_LOTE) {
                const loteActual = medicos.slice(i, i + TAMANO_LOTE);

                // Procesamos el lote actual en paralelo para mayor eficiencia
                await Promise.all(loteActual.map(async (medico) => {
                    try {
                        const agenda = new Agenda();
                        await agenda.refrescarTurnos(medico);
                        metricas.procesados++;
                    } catch (errorMedico) {
                        metricas.fallidos++;
                        console.error(`[BATCH ERROR] Médico ID ${medico.id}: ${errorMedico.message}`);
                    }
                }));

                console.log(`[BATCH PROGRESS] Lote completado. Progreso: ${metricas.procesados + metricas.fallidos}/${metricas.total}`);
            }

            // 3. Reporte final
            console.log(`
            --- RESUMEN DEL PROCESO BATCH ---
            Finalizado: ${new Date().toISOString()}
            Total Médicos: ${metricas.total}
            Exitosos:      ${metricas.procesados}
            Fallidos:      ${metricas.fallidos}
            ---------------------------------`);

        } catch (error) {
            console.error("[BATCH CRITICAL ERROR] Fallo general del proceso:", error);
            throw error; // Relanzamos para que el CronJob pueda loguear el fallo fatal
        }
    }

}

export const turnoService = new TurnoService();
import { turnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { notificacionRepository } from '../infrastructure/repositories/NotificacionRepository.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Cancelado } from '../domain/notificacion/estado-turno/Cancelado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Realizado } from '../domain/notificacion/estado-turno/Realizado.js';
import { Agenda } from '../domain/agenda/Agenda.js';
import { Disponible } from '../domain/notificacion/estado-turno/Disponible.js';
import { EstadoTurno } from '../domain/turno/EstadoTurno.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { Rol } from '../domain/usuario/Rol.js';

export class TurnoService {
  turnoRepository;
  pacienteRepository;

  constructor({
    turnoRepository: turnoRepo = turnoRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
    notificacionRepository: notificacionRepo = notificacionRepository,
    medicoRepository: medicoRepo = medicoRepository,
    pacienteRepository: pacienteRepo = pacienteRepository,
  } = {}) {
    this.turnoRepository = turnoRepo;
    this.usuarioRepository = usuarioRepo;
    this.notificacionRepository = notificacionRepo;
    this.medicoRepository = medicoRepo;
    this.pacienteRepository = pacienteRepo;
  }

  async reservarTurno(id_usuario, id_turno) {
    const usuario = await this.usuarioRepository.findById(id_usuario);
    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const paciente = await this.pacienteRepository.findByIdUsuario(id_usuario);
    if (paciente == null) {
      throw new NotFoundError('Paciente no encontrado');
    }

    const turno = await this.turnoRepository.findById(id_turno);

    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    if (!(turno.estado instanceof Disponible)) {
      throw new ConflictError('El turno no está disponible');
    }

    if (turno.paciente == paciente) {
      console.log('HAY QUE ELIMINAR LA LINEA DE ABAJO');
    }

    turno.paciente = paciente;

    const turnosReservados = await this.turnoRepository.findAllByMedicIdAndEstado(
      turno.medico._id,
      EstadoTurno.RESERVADO,
    );

    turno.fechaHora = Agenda.generarFechaHora(turnosReservados, turno);

    const notificacion = turno.actualizarEstado(usuario, new Reservado(turno), 'Reserva de turno');
    

    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }
    await this.turnoRepository.save(turno);

    return turno;
  }

  async cancelarTurno(id_usuario, id_turno, esMedico, motivo) {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const turno = await this.turnoRepository.findById(id_turno);

    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    if (!(turno.estado instanceof Reservado) && !(turno.estado instanceof Confirmado)) {
      throw new ConflictError('No se puede cancelar el turno en este estado');
    }

    if (!esMedico) {
      if (!usuario.roles.includes(Rol.PACIENTE)) {
        throw new NotFoundError('El usuario no tiene rol de paciente');
      }
      const idUsuarioDelPaciente = turno.paciente?.usuario?._id || turno.paciente?.usuario;
      if (String(idUsuarioDelPaciente) !== String(usuario.id || usuario._id)) {
        throw new ConflictError('El paciente no tiene el turno asignado');
      }
    } else {
      if (!usuario.roles.includes(Rol.MEDICO)) {
        throw new NotFoundError('El usuario no tiene rol de médico');
      }
      const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;
      if (String(idUsuarioDelMedico) !== String(usuario.id || usuario._id)) {
        throw new ConflictError('El médico no tiene el turno asignado');
      }
    }

    const unaHoraEnMs = 1000 * 60 * 60;
    if (turno.fechaHora - Date.now() < unaHoraEnMs) {
      throw new ConflictError('Un turno no puede cancelarse con menos de 1 hora de antelación');
    }

    const notificacion = turno.actualizarEstado(usuario, new Cancelado(turno), motivo);

    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }

    await this.turnoRepository.save(turno);

    return turno;
  }

  async obtenerHistorial(idPaciente, idMedico) {
    const medico = await this.medicoRepository.findByIdUsuario(idMedico);

    if (medico == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const paciente = await this.pacienteRepository.findByIdUsuario(idPaciente);

    if (paciente == null) {
      throw new NotFoundError('Paciente no encontrado');
    }

    const historial = await this.turnoRepository.findAllByPatientId(paciente.id || paciente._id);

    return historial.map((t) => this._mapearTurno(t));
  }

  async finalizarTurno(id_usuario, id_turno) {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!usuario.roles.includes(Rol.MEDICO)) {
      throw new ForbiddenError('No tiene permiso para realizar esta acción, no es médico');
    }

    const turno = await this.turnoRepository.findById(id_turno);

    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;

    if (String(idUsuarioDelMedico) !== String(usuario.id || usuario._id)) {
      throw new ConflictError('El turno no pertenece al medico');
    }

    if (!(turno.estado instanceof Confirmado)) {
      throw new ConflictError('El turno no está en estado confirmado');
    }

    turno.actualizarEstado(usuario, new Realizado(turno), 'Turno finalizado');

    if (Array.isArray(turno.medico?.turnosActualesYFuturos)) {
      const indice = turno.medico.turnosActualesYFuturos.findIndex(
        (t) => String(t._id || t.id) === String(turno.id),
      );

      if (indice !== -1) {
        turno.medico.turnosActualesYFuturos.splice(indice, 1);
        await this.medicoRepository.save(turno.medico);
      }
    }

    await this.turnoRepository.save(turno);

    return turno;
  }

  async aceptarTurno(id_usuario, id_turno) {
    const usuario = await this.usuarioRepository.findById(id_usuario);

    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!usuario.roles.includes(Rol.MEDICO)) {
      throw new ForbiddenError('No tiene permiso para realizar esta acción, no es médico');
    }

    const turno = await this.turnoRepository.findById(id_turno);

    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;

    if (String(idUsuarioDelMedico) !== String(usuario.id || usuario._id)) {
      throw new ConflictError('El turno no pertenece al medico');
    }

    if (!(turno.estado instanceof Reservado)) {
      throw new ConflictError('Solo se pueden confirmar turnos que están reservados');
    }

    const notificacion = turno.actualizarEstado(usuario, new Confirmado(turno), 'Turno confirmado');
    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }

    await this.turnoRepository.save(turno);
    return turno;
  }

  async obtenerDisponibilidad(id_usuario, id_servicio) {
    const medico = await this.medicoRepository.findByIdUsuario(id_usuario);

    if (medico == null) {
      throw new NotFoundError('Médico no encontrado');
    }

    const turnosDelServicio = await this.turnoRepository.findDisponiblesByMedicIdAndServicioId(
      medico.id || medico._id,
      id_servicio,
    );

    return turnosDelServicio.map((t) => this._mapearTurno(t));
  }

  async refrescarSlots() {

    const TAMANO_LOTE = 20;
    const metricas = { procesados: 0, fallidos: 0, total: 0 };
    const duracionSlot = parseInt(process.env.DURACION_SLOT_MINUTOS) || 30;
    const semanasMaxGeneracionSlots = parseInt(process.env.NUM_SEMANAS_GENERAR_SLOTS) || 4;

    console.log(`[BATCH START] ${new Date().toISOString()} - Inicio de refresco de turnos.`);

    try {
      // 1. Obtener todos los médicos
      const medicos = await this.medicoRepository.findAll();
      metricas.total = medicos?.length || 0;

      if (metricas.total === 0) {
        console.log('[BATCH] No hay médicos para procesar.');
        return;
      }

      // 2. Procesamiento por lotes (Chunks)
      for (let i = 0; i < medicos.length; i += TAMANO_LOTE) {
        const loteActual = medicos.slice(i, i + TAMANO_LOTE);

        // Procesamos el lote actual en paralelo
        await Promise.all(
          loteActual.map(async (medico) => {
            try {

              const slotsTotales = await this.slotRepository.findAllSlotsByMedicId(medico.id || medico._id);

              const {slotsEliminados, slotsNuevos} = Agenda.refrescarSlots(
                medico,
                slotsTotales,
                duracionSlot,
                semanasMaxGeneracionSlots,
              );

              for (const slot of slotsEliminados) {
                await this.slotsRepository.delete(slot.id || slot._id);
              }

              for (const slot of slotsNuevos) {
                await this.slotsRepository.save(slot);
              }

              metricas.procesados++;
            } catch (errorMedico) {
              metricas.fallidos++;
              console.error(`[BATCH ERROR] Médico ID ${medico.id}: ${errorMedico.message}`);
            }
          }),
        );

        console.log(
          `[BATCH PROGRESS] Lote completado. Progreso: ${metricas.procesados + metricas.fallidos}/${metricas.total}`,
        );
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
      console.error('[BATCH CRITICAL ERROR] Fallo general del proceso:', error);
      throw error;
    }
  }

  async obtenerTurnosMedico(id_usuario) {
    const medico = await this.medicoRepository.findByIdUsuario(id_usuario);

    if (medico == null) {
      throw new NotFoundError('Médico no encontrado');
    }

    const turnos = await this.turnoRepository.findAllByMedicId(medico.id || medico._id);

    return turnos.map((t) => this._mapearTurno(t));
  }

  async getAll() {
    const turnos = await this.turnoRepository.findAll();
    return turnos.map((t) => this._mapearTurno(t));
  }

  _mapearTurno(t) {
    return {
      id_turno: t.id || t._id,
      id_medico: t.medico ? t.medico.id || t.medico._id : 'N/A',
      id_paciente: t.paciente ? t.paciente.id || t.paciente._id : 'N/A',
      fechaHora: t.fechaHora ? t.fechaHora : 'N/A',
      sede: t.sede ? t.sede.nombre || t.sede : 'N/A',

      servicio_id: t.servicio ? (t.servicio._id ? t.servicio._id : 'N/A') : 'N/A',
      servicio_nombre: t.servicio ? (t.servicio.nombre ? t.servicio.nombre : 'N/A') : 'N/A',

      estado: t.estado ? t.estado.getEstadoNombre() : 'N/A',

      historialEstados: t.historialEstados.map((e) => ({
        fechaHoraCambio: e.fechaHoraIngreso,
        estado: e.estado,
        motivo: e.motivo ? e.motivo : 'N/A',
        actor: e.usuario ? e.usuario.nombreUsuario : 'N/A',
      })),
      costo: t.costo,
      diaSemana: t.diaSemana,
      hora: t.hora,
    };
  }
}

export const turnoService = new TurnoService();

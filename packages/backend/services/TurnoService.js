import { turnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { notificacionRepository } from '../infrastructure/repositories/NotificacionRepository.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { slotRepository } from '../infrastructure/repositories/SlotRepository.js';
import { servicioRepository } from '../infrastructure/repositories/ServicioRepository.js';
import { Reservado } from '../domain/notificacion/estado-turno/Reservado.js';
import { Cancelado } from '../domain/notificacion/estado-turno/Cancelado.js';
import { Confirmado } from '../domain/notificacion/estado-turno/Confirmado.js';
import { Realizado } from '../domain/notificacion/estado-turno/Realizado.js';
import { Agenda } from '../domain/agenda/Agenda.js';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';
import { Rol } from '../domain/usuario/Rol.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { ordenarSlots, validarSlotsContiguos } from '../utils/functions.js';
import { Turno } from '../domain/turno/Turno.js';
import { estaEnDisponibilidad } from '../utils/functions.js';
import { logger } from '../utils/logger.js';
import util from 'util';

export class TurnoService {
  turnoRepository;
  pacienteRepository;

  constructor({
    turnoRepository: turnoRepo = turnoRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
    notificacionRepository: notificacionRepo = notificacionRepository,
    medicoRepository: medicoRepo = medicoRepository,
    pacienteRepository: pacienteRepo = pacienteRepository,
    slotRepository: slotRepo = slotRepository,
    servicioRepository: servicioRepo = servicioRepository,
  } = {}) {
    this.turnoRepository = turnoRepo;
    this.usuarioRepository = usuarioRepo;
    this.notificacionRepository = notificacionRepo;
    this.medicoRepository = medicoRepo;
    this.pacienteRepository = pacienteRepo;
    this.slotRepository = slotRepo;
    this.servicioRepository = servicioRepo;
  }

  async reservarTurno(dtoReserva) {

    const usuario = await this.usuarioRepository.findById(dtoReserva.id_usuario);

    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const paciente = await this.pacienteRepository.findByIdUsuario(dtoReserva.id_usuario);
    if (paciente == null) {
      throw new NotFoundError('Paciente no encontrado');
    }

    const servicio = await this.servicioRepository.findById(dtoReserva.id_servicio);

    if (servicio == null) {
      throw new NotFoundError('Servicio no encontrado');
    }

    if (dtoReserva.slotsIds == null || !Array.isArray(dtoReserva.slotsIds) || dtoReserva.slotsIds.length === 0) {
      throw new BadRequestError('Debe proporcionar una lista de IDs de slots para reservar');
    }

    let slots = [];

    for (const id_slot of dtoReserva.slotsIds) {
      ValidadorId.validarIds(id_slot);
      const slot = await this.slotRepository.findById(id_slot);
      if (slot == null) {
        throw new NotFoundError(`Slot no encontrado: ${id_slot}`);
      }
      if (slot.estado !== 'DISPONIBLE') {
        throw new ConflictError(`El slot con ID ${id_slot} no está disponible para reserva`);
      }
      slots.push(slot);
    }

    // Validación 1: todos los slots deben pertenecer al mismo médico
    const idMedicoDelPrimerSlot = String(slots[0].medico?._id || slots[0].medico);
    const todosMismoMedico = slots.every(
      (s) => String(s.medico?._id || s.medico) === idMedicoDelPrimerSlot
    );
    if (!todosMismoMedico) {
      throw new BadRequestError('Todos los slots deben pertenecer al mismo médico');
    }

    slots = ordenarSlots(slots);

    if (!validarSlotsContiguos(slots)) {
      throw new BadRequestError('Los slots seleccionados deben ser contiguos');
    }

    const slot = slots[0];
    const fechaTurno = slot.fecha;
    const horaInicioTurno = slot.horaInicio;
    const medico = await this.medicoRepository.findById(idMedicoDelPrimerSlot);

    if (medico == null) {
      throw new NotFoundError('Médico asociado a los slots no encontrado');
    }

    // Validación 2: el médico debe tener el servicio solicitado como especialidad o práctica
    const idServicio = String(dtoReserva.id_servicio);
    const tieneServicio =
      medico.especialidades.some((e) => String(e._id || e) === idServicio) ||
      medico.practicas.some((p) => String(p._id || p) === idServicio);

    if (!tieneServicio) {
      throw new BadRequestError('El médico no ofrece el servicio solicitado');
    }

    const slotsAOcupar = Agenda.obtenerSlotsContiguosParaDuracion(slots, servicio.duracionTurnoEnMins);

    const tiempoRecolectado = slotsAOcupar.reduce((acc, s) => acc + s.duracionMins, 0);

    console.log('TIEMPO RECOLECTADO: ', tiempoRecolectado);
    console.log('DURACION SERVICIO: ', servicio.duracionTurnoEnMins);

    if (tiempoRecolectado < servicio.duracionTurnoEnMins) {
      throw new BadRequestError('Los slots provistos no son suficientes para cubrir la duración del servicio.');
    }

    if (slotsAOcupar.length === 0) {
      throw new ConflictError('No hay suficientes slots contiguos disponibles para la duración del servicio');
    }

    slotsAOcupar.forEach((s) => s.estado = 'RESERVADO');

    const turno = new Turno(medico, paciente, fechaTurno, horaInicioTurno, null, servicio, servicio.costo);

    turno.slotsAsociados.push(...slotsAOcupar);

    const notificacion = turno.actualizarEstado(usuario, new Reservado(turno), 'Reserva de turno');

    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }
    const turnoGuardado = await this.turnoRepository.save(turno);

    const turnoId = turnoGuardado.id || turnoGuardado._id;

    for (const slotAOcupar of slotsAOcupar) {
      slotAOcupar.turnoAsociado = turnoId;
      await this.slotRepository.save(slotAOcupar);
    }

    return;
  }

  async cancelarTurno(id_usuario, id_turno, esMedico, motivo) {
    const diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

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

    // Validación: el turno no puede cancelarse si su fecha ya pasó
    if (Date.now() > turno.fechaHora.getTime()) {
      throw new ConflictError('No se puede cancelar un turno que ya ha pasado su fecha y hora programada');
    }

    // Validación: no cancelar con menos de 1 hora de antelación
    const unaHoraEnMs = 1000 * 60 * 60;
    if (turno.fechaHora.getTime() - Date.now() < unaHoraEnMs) {
      throw new ConflictError('Un turno no puede cancelarse con menos de 1 hora de antelación');
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

    const notificacion = turno.actualizarEstado(usuario, new Cancelado(turno), motivo);

    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }

    await this.turnoRepository.save(turno);

    // Liberar o eliminar los slots según si la disponibilidad del médico sigue vigente
    for (const slot of turno.slotsAsociados) {
      const [anio, mes, dia] = slot.fecha.split('-').map(Number);
      const diaSemanaSlot = diasSemana[new Date(anio, mes - 1, dia).getDay()];

      const sigueSiendoValido = turno.medico.disponibilidades.some((disp) =>
        estaEnDisponibilidad(diaSemanaSlot, slot.horaInicio, disp)
      );

      if (sigueSiendoValido) {
        slot.estado = 'DISPONIBLE';
        slot.turnoAsociado = null;
        await this.slotRepository.save(slot);
      } else {
        await this.slotRepository.delete(slot.id || slot._id);
      }
    }

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

    for(const slot of turno.slotsAsociados) {
      slot.estado = 'FINALIZADO';
      await this.slotRepository.save(slot);
    }

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

  async confirmarTurno(id_usuario, id_turno, id_sede) {
  logger.debug(`[CONFIRMAR TURNO] Iniciando proceso para Turno ID: ${id_turno}`);

  // 1. Validaciones iniciales de existencia y permisos del Usuario
  const usuario = await this.usuarioRepository.findById(id_usuario);
  if (usuario == null) {
    throw new NotFoundError('Usuario no encontrado');
  }

  if (!usuario.roles.includes(Rol.MEDICO)) {
    throw new ForbiddenError('No tiene permiso para realizar esta acción, no es médico');
  }

  // 2. Validaciones de existencia y estado del Turno
  const turno = await this.turnoRepository.findById(id_turno);
  if (turno == null) {
    throw new NotFoundError('Turno no encontrado');
  }

  const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;
  if (String(idUsuarioDelMedico) !== String(usuario.id || usuario._id)) {
    throw new ConflictError('El turno no pertenece al medico');
  }

  if (!(turno.estado.getEstadoNombre() === 'RESERVADO')) {
    throw new ConflictError('Solo se pueden confirmar turnos que están reservados');
  }

  // --- LÓGICA DE RESTRICCIÓN DE SEDE UTILIZANDO SLOT REPOSITORY ---
  const idMedico = turno.medico?.id || turno.medico?._id || turno.medico;
  const slotsDelMedico = await this.slotRepository.findAllSlotsByMedicId(idMedico);
  
  // Función interna para formatear de forma segura cualquier variante de fecha de la DB
  const parsearFechaSegura = (fechaInput) => {
    if (!fechaInput) return new Date(NaN);
    if (fechaInput instanceof Date) return fechaInput;
    if (typeof fechaInput === 'string' && fechaInput.includes('/')) {
      const partes = fechaInput.split('/');
      return new Date(`${partes[2]}-${partes[1]}-${partes[0]}T00:00:00`);
    }
    return new Date(fechaInput);
  };

  const fechaTurnoTarget = parsearFechaSegura(turno.fechaHora || turno.fecha).toDateString();

  logger.debug(`[CONFIRMAR TURNO] Iniciando validación de sede para Médico ID: ${idMedico}`);
  logger.debug(`[CONFIRMAR TURNO] Fecha Target del Turno (toDateString): "${fechaTurnoTarget}"`);
  logger.debug(`[CONFIRMAR TURNO] Total de slots recuperados para el médico: ${slotsDelMedico?.length || 0}`);

  // CORRECCIÓN RESTRICCIÓN: Evaluamos que realmente exista una sede física grabada (con _id válido)
  const slotConSedeExistente = slotsDelMedico.find((s) => {
    const fechaSlotStr = parsearFechaSegura(s.fecha || s.fechaHora).toDateString();
    return fechaSlotStr === fechaTurnoTarget && s.sede && s.sede._id !== null && s.sede._id !== undefined;
  });

  const yaTieneSedeAsignada = !!slotConSedeExistente;
  logger.debug(`[CONFIRMAR TURNO] ¿Ya tiene sede asignada en el día?: ${yaTieneSedeAsignada}`);

  let sedeFinal = id_sede;

  // UBICACIÓN ESTRATÉGICA: Buscamos y declaramos los datos de la sede médica completa antes de usarla
  const buscarSedeCompleta = (idBuscar) => {
    return turno.medico?.sedes?.find(s => String(s._id || s.id) === String(idBuscar));
  };

  if (yaTieneSedeAsignada) {
    const idSedeExistente = slotConSedeExistente.sede?._id || slotConSedeExistente.sede?.id || slotConSedeExistente.sede;
    
    logger.debug(`[CONFIRMAR TURNO] Sede existente encontrada en la DB para este día: ${idSedeExistente}`);
    logger.debug(`[CONFIRMAR TURNO] Sede solicitada en el body: ${id_sede || 'Ninguna (Heredará automática)'}`);

    // Si mandó una sede por body, verificamos que coincida con la que ya rige en el día
    if (id_sede && String(idSedeExistente) !== String(id_sede)) {
      logger.debug(`[CONFIRMAR TURNO] CONFLICTO: Intentó cambiar la sede del día. Lanzando ConflictError.`);
      throw new ConflictError('El médico ya tiene asignada otra sede para este día.');
    }
    
    // Si no mandó nada, hereda la del día
    sedeFinal = idSedeExistente;
    logger.debug(`[CONFIRMAR TURNO] ÉXITO: Se utilizará la sede preexistente: ${sedeFinal}`);
  } else {
    logger.debug(`[CONFIRMAR TURNO] Primer turno con sede del día.`);

    if (!id_sede) {
      throw new BadRequestError('Debe especificar una sede en el body para el primer turno del día.');
    }

    // Buscamos la info de la sede solicitada en el médico para poder propagarla con estructura
    const sedeMedicaCompleta = buscarSedeCompleta(sedeFinal);
    if (!sedeMedicaCompleta) {
      throw new BadRequestError('La sede especificada no corresponde a las sedes habilitadas del profesional.');
    }

    logger.debug(`[CONFIRMAR TURNO] Filtrando slots disponibles para propagar...`);
    const slotsDisponiblesDelDia = slotsDelMedico.filter((s) => {
      const fechaSlotStr = parsearFechaSegura(s.fecha || s.fechaHora).toDateString();
      return fechaSlotStr === fechaTurnoTarget && s.estado === 'DISPONIBLE';
    });

    logger.debug(`[CONFIRMAR TURNO] Cantidad de slots encontrados para propagar sede: ${slotsDisponiblesDelDia.length}`);

    // Propagación estructurada a todos los slots libres del día
    for (const slot of slotsDisponiblesDelDia) {
      logger.debug(`[CONFIRMAR TURNO] Propagando sede estructurada ${sedeMedicaCompleta.nombre} al Slot ID: ${slot._id || slot.id}`);
      slot.sede = {
        _id: sedeMedicaCompleta._id || sedeMedicaCompleta.id,
        nombre: sedeMedicaCompleta.nombre
      };
      await this.slotRepository.save(slot);
    }
  }

  // 3. Asignación final estructurada de la Sede al Turno
  logger.debug(`[CONFIRMAR TURNO] Asignando sede ${sedeFinal} al documento del Turno actual: ${id_turno}`);
  const sedeMedicaCompleta = buscarSedeCompleta(sedeFinal) || slotConSedeExistente?.sede;

  if (sedeMedicaCompleta) {
    logger.debug(`[CONFIRMAR TURNO] Estructura de sede definida. Asignando subdocumento completo.`);
    turno.sede = {
      _id: sedeMedicaCompleta._id || sedeMedicaCompleta.id,
      nombre: sedeMedicaCompleta.nombre
    };
  } else {
    logger.warn(`[CONFIRMAR TURNO] No se encontró la sede en el listado del médico. Usando fallback básico.`);
    turno.sede = {
      _id: new mongoose.Types.ObjectId(sedeFinal),
      nombre: "Sede Asignada"
    };
  }

  // 4. Actualizamos el slot físico exacto que pertenece al horario de este turno
  const slotActual = slotsDelMedico.find(s => {
    const fechaSlotStr = parsearFechaSegura(s.fecha || s.fechaHora).toDateString();
    return fechaSlotStr === fechaTurnoTarget && s.horaInicio === turno.hora;
  });

  if (slotActual) {
    logger.debug(`[CONFIRMAR TURNO] Actualizando slot de la cita actual (${turno.hora}) a RESERVADO con su sede.`);
    slotActual.sede = {
      _id: turno.sede._id,
      nombre: turno.sede.nombre
    };
    slotActual.estado = 'RESERVADO';
    await this.slotRepository.save(slotActual);
  }

  // 5. Flujo de Transición de Estados y Notificaciones
  logger.debug(`[CONFIRMAR TURNO] Actualizando estado del turno a CONFIRMADO...`);
  const notificacion = turno.actualizarEstado(usuario, new Confirmado(turno), 'Turno confirmado');
  
  if (notificacion) {
    logger.debug(`[CONFIRMAR TURNO] Notificación generada. Guardando en repositorio...`);
    await this.notificacionRepository.save(notificacion);
  } else {
    logger.debug(`[CONFIRMAR TURNO] No se generó ninguna notificación para este cambio de estado.`);
  }

  // 6. Guardado final del documento del Turno
  await this.turnoRepository.save(turno);
  logger.debug(`[CONFIRMAR TURNO] Proceso finalizado con éxito. Turno guardado.`);
  
  return turno;
}

  async obtenerDisponibilidad(id_usuario, id_servicio) {
    const medico = await this.medicoRepository.findByIdUsuario(id_usuario);

    if (medico == null) {
      throw new NotFoundError('Médico no encontrado');
    }

    const slotsDelMedico = await this.slotRepository.findAllSlotsByMedicId(medico.id || medico._id);

    const servicio = await this.servicioRepository.findById(id_servicio);

    if (servicio == null) {
      throw new NotFoundError('Servicio no encontrado');
    }

    const idServicio = String(id_servicio);
    const tieneServicio =
      medico.especialidades.some((e) => String(e._id || e) === idServicio) ||
      medico.practicas.some((p) => String(p._id || p) === idServicio);

    if (!tieneServicio) {
      throw new BadRequestError('El médico no ofrece el servicio solicitado');
    }

    const turnosDelServicio = this.generarTurnosSegunMedicoYServicio(medico, slotsDelMedico, servicio);

    return turnosDelServicio.map((t) => this.mapearTurnoDisponibles(t));
  }

  async refrescarSlots() {

    const TAMANO_LOTE = 20;
    const metricas = { procesados: 0, fallidos: 0, total: 0 };
    const duracionSlot = parseInt(process.env.DURACION_SLOT_MINUTOS) || 30;
    const semanasMaxGeneracionSlots = parseInt(process.env.NUM_SEMANAS_GENERAR_SLOTS) || 4;

    console.log(`[BATCH START] ${new Date().toISOString()} - Inicio de refresco de turnos.`);

    try {
      const medicos = await this.medicoRepository.findAll();
      metricas.total = medicos?.length || 0;

      if (metricas.total === 0) {
        console.log('[BATCH] No hay médicos para procesar.');
        return;
      }

      for (let i = 0; i < medicos.length; i += TAMANO_LOTE) {
        const loteActual = medicos.slice(i, i + TAMANO_LOTE);

        await Promise.all(
          loteActual.map(async (medico) => {
            try {
              const slotsTotales = await this.slotRepository.findAllSlotsByMedicId(medico.id || medico._id);

              console.log("MEDICO: " + medico.nombre);

              const {slotsEliminados, slotsNuevos} = Agenda.refrescarSlots(
                medico,
                slotsTotales,
                duracionSlot,
                semanasMaxGeneracionSlots,
              );

              for (const slot of slotsEliminados) {
                await this.slotRepository.delete(slot.id || slot._id);
              }

              for (const slot of slotsNuevos) {
                await this.slotRepository.save(slot);
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

  async obtenerSlotsMedico(id_usuario) {
    const medico = await this.medicoRepository.findByIdUsuario(id_usuario);

    if (medico == null) {
      throw new NotFoundError('Médico no encontrado');
    }

    const slots = await this.slotRepository.findAllSlotsByMedicId(medico.id || medico._id);

    return slots.map((s) => this._mapearSlot(s));
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

  mapearTurnoDisponibles(t){
    return {
      id_medico: t.medico ? t.medico.id || t.medico._id : 'N/A',
      nombreMedico: t.medico && t.medico.nombre ? t.medico.nombre : 'N/A',
      fechaHora: t.fechaHora ? t.fechaHora : 'N/A',

      servicio_id: t.servicio ? (t.servicio._id ? t.servicio._id : 'N/A') : 'N/A',
      servicio_nombre: t.servicio ? (t.servicio.nombre ? t.servicio.nombre : 'N/A') : 'N/A',

      costo: t.costo,
      hora: t.hora,
      fecha: t.fechaHora ? t.fechaHora : 'N/A',

      slotsAsociados: t.slotsAsociados ? t.slotsAsociados.map(s => s.id || s._id) : []
    };
  }

  _mapearTurno(t) {
    const tieneSedeValida = t.sede && (t.sede._id !== null && t.sede._id !== undefined || t.sede.nombre);

    return {
      id_turno: t.id || t._id,
      id_medico: t.medico ? t.medico.id || t.medico._id : 'N/A',
      nombreMedico: t.medico && t.medico.nombre ? t.medico.nombre : 'N/A',
      id_paciente: t.paciente ? t.paciente.id || t.paciente._id : 'N/A',
      fechaHora: t.fechaHora ? t.fechaHora : 'N/A',
      
      // Contrato unificado: misma estructura exacta que el slot
      sede: tieneSedeValida ? {
        id_sede: t.sede._id ? t.sede._id.toString() : null,
        nombre: t.sede.nombre || 'N/A'
      } : null,

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

  _mapearSlot(s) {
    const tieneSedeValida = s.sede && (s.sede._id !== null && s.sede._id !== undefined || s.sede.nombre);

    return {
      id_slot: s.id || s._id,
      id_medico: s.medico ? s.medico.toString() : 'N/A',
      fecha: s.fecha,
      horaInicio: s.horaInicio,
      duracionMins: s.duracionMins,
      estado: s.estado,
      sede: tieneSedeValida ? {
        id_sede: s.sede._id ? s.sede._id.toString() : null,
        nombre: s.sede.nombre || 'N/A'
      } : null,
      
      id_turno_asociado: s.turnoAsociado ? s.turnoAsociado.toString() : null,
    };
  }

  generarTurnosSegunMedicoYServicio(medico, slots, servicio) {
    const turnosGenerados = [];

    const slotsDisponibles = slots.filter(s => s.estado === 'DISPONIBLE');
    const slotsOrdenados = ordenarSlots(slotsDisponibles);
    const slotsPorFecha = Agenda.agruparSlotsPorFecha(slotsOrdenados);
    const duracionTurno = servicio.duracionTurnoEnMins;

    for (const slotsDelDia of slotsPorFecha) {
      let i = 0;

      while (i < slotsDelDia.length) {
        const slotsParaTurno = [slotsDelDia[i]];
        let minutosAcumulados = slotsDelDia[i].duracionMins;

        // Extender con slots contiguos hasta cubrir la duración
        let j = i + 1;
        while (j < slotsDelDia.length && minutosAcumulados < duracionTurno) {
          const ultimoSlot = slotsParaTurno[slotsParaTurno.length - 1];
          if (!validarSlotsContiguos([ultimoSlot, slotsDelDia[j]])) break;

          slotsParaTurno.push(slotsDelDia[j]);
          minutosAcumulados += slotsDelDia[j].duracionMins;
          j++;
        }

        if (minutosAcumulados >= duracionTurno) {
          // Turno válido: avanzar i hasta después del último slot usado
          const turno = new Turno(
            medico,
            null,
            slotsParaTurno[0].fecha,
            slotsParaTurno[0].horaInicio,
            null,
            servicio,
            servicio.costo,
          );
          turno.slotsAsociados.push(...slotsParaTurno);
          turnosGenerados.push(turno);
          i = j; // saltar al slot siguiente al último consumido
        } else {
          // No se pudo armar un turno desde este slot (hueco o fin de lista)
          i++;
        }
      }
    }

    return turnosGenerados;
  }


  async proponerReprogramacion(id_usuario, id_turno, nuevaFechaHora, motivo) {
    const usuario = await this.usuarioRepository.findById(id_usuario);
    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const turno = await this.turnoRepository.findById(id_turno);
    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    // 1. Validamos de forma segura el string del estado para evitar fallas de instanceof
    const nombreEstado =
      typeof turno.estado.getEstadoNombre === 'function'
        ? turno.estado.getEstadoNombre().toUpperCase()
        : String(turno.estado).toUpperCase();

    if (nombreEstado !== 'RESERVADO' && nombreEstado !== 'CONFIRMADO') {
      throw new ConflictError('No se puede solicitar la reprogramación de un turno en este estado');
    }

    // 2. Validamos que quien llama sea el paciente o el médico dueño del turno
    const idUsuarioDelPaciente = turno.paciente?.usuario?._id || turno.paciente?.usuario;
    const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;

    const esPacienteDelTurno = String(idUsuarioDelPaciente) === String(usuario.id || usuario._id);
    const esMedicoDelTurno = String(idUsuarioDelMedico) === String(usuario.id || usuario._id);

    if (!esPacienteDelTurno && !esMedicoDelTurno) {
      throw new ForbiddenError(
        'No tiene permisos sobre este turno para solicitar una reprogramación',
      );
    }

    // 3. Regla de negocio: Cambios con al menos 1 hora de anticipación
    const unaHoraEnMs = 1000 * 60 * 60;
    if (turno.fechaHora - Date.now() < unaHoraEnMs) {
      throw new ConflictError(
        'No se puede proponer una modificación con menos de 1 hora de antelación',
      );
    }

    // 4. Convertimos la fecha/hora en el Service y buscamos el SLOT físico
    const idMedico = turno.medico?._id || turno.medico?.id || turno.medico;
    
    // Hacemos la magia del formateo acá en la capa de servicio
    const dateObj = new Date(nuevaFechaHora);
    const fechaBuscada = dateObj.toISOString().split('T')[0]; // "2026-05-23"
    
    const horas = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutos = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const horaBuscada = `${horas}:${minutos}`; // "08:00"

    // Pasamos los parámetros ya masticados al repositorio
    const slotDestino = await this.slotRepository.findByMedicFechaHora(idMedico, fechaBuscada, horaBuscada);

    if (!slotDestino) {
      throw new ConflictError(
        'El horario propuesto no se encuentra disponible para este profesional',
      );
    }

    // 5. Validamos que el bache de destino sea de la misma especialidad/servicio
    const idServicioOriginal = String(turno.servicio?._id || turno.servicio?.id || turno.servicio);
    const idServicioDestino = String(
      slotDestino.servicio?._id || slotDestino.servicio?.id || slotDestino.servicio,
    );

    if (idServicioOriginal !== idServicioDestino) {
      throw new ConflictError(
        `No se puede reprogramar: El horario seleccionado corresponde al servicio de "${slotDestino.servicio?.nombre || 'otra especialidad'}" y su turno original es de "${turno.servicio?.nombre}"`,
      );
    }

    // Delegamos al dominio para transicionar a PENDIENTE_REPROGRAMACION
    const notificacion = turno.solicitarReprogramacion(usuario, nuevaFechaHora, motivo);

    if (notificacion) {
      await this.notificacionRepository.save(notificacion);
    }
    await this.turnoRepository.save(turno);

    return turno;
  }

  async responderReprogramacion(id_usuario, id_turno, aceptado) {
    const usuario = await this.usuarioRepository.findById(id_usuario);
    if (usuario == null) {
      throw new NotFoundError('Usuario no encontrado');
    }

    const turno = await this.turnoRepository.findById(id_turno);
    if (turno == null) {
      throw new NotFoundError('Turno no encontrado');
    }

    // 1. Validamos que efectivamente haya una propuesta guardada esperando respuesta
    if (!turno.propuestaCambio || !turno.propuestaCambio.nuevaFechaHora) {
      throw new ConflictError('Este turno no posee ninguna propuesta de reprogramación pendiente');
    }

    // 2. El candado: Quien responde NO puede ser el mismo que propuso el cambio
    const idProponente = String(turno.propuestaCambio.proponenteId);
    const idRespondedor = String(usuario.id || usuario._id);

    if (idProponente === idRespondedor) {
      throw new ConflictError('No podés responder a tu propia propuesta de reprogramación');
    }

    // 3. Validamos que quien responde pertenezca al turno (médico o paciente)
    const idUsuarioDelPaciente = turno.paciente?.usuario?._id || turno.paciente?.usuario;
    const idUsuarioDelMedico = turno.medico?.usuario?._id || turno.medico?.usuario;

    const esPacienteDelTurno = String(idUsuarioDelPaciente) === idRespondedor;
    const esMedicoDelTurno = String(idUsuarioDelMedico) === idRespondedor;

    if (!esPacienteDelTurno && !esMedicoDelTurno) {
      throw new ForbiddenError(
        'No tiene permisos para responder a la reprogramación de este turno',
      );
    }

    // 4. Procesamos la decisión
    if (aceptado) {
      const idMedico = turno.medico?._id || turno.medico?.id || turno.medico;

      // --- PASO A: LIBERAR SLOT VIEJO ---
      // Desglosamos la fecha/hora actual del turno (antes de modificarla)
      const dateVieja = new Date(turno.fechaHora);
      const fechaViejaStr = dateVieja.toISOString().split('T')[0];
      const horaViejaStr = `${String(dateVieja.getUTCHours()).padStart(2, '0')}:${String(dateVieja.getUTCMinutes()).padStart(2, '0')}`;

      // Buscamos el slot actual del turno (Ojo: este no filtramos por 'DISPONIBLE' porque está ocupado)
      const slotViejo = await this.slotRepository.model.findOne({
        medico: idMedico,
        fecha: fechaViejaStr,
        horaInicio: horaViejaStr
      });

      if (slotViejo) {
        slotViejo.estado = 'DISPONIBLE';
        slotViejo.turnoAsociado = null;
        await this.slotRepository.save(slotViejo);
      }

      // --- PASO B: RESERVAR SLOT NUEVO ---
      // Desglosamos la nueva fecha/hora propuesta
      const dateNueva = new Date(turno.propuestaCambio.nuevaFechaHora);
      const fechaNuevaStr = dateNueva.toISOString().split('T')[0];
      const horaNuevaStr = `${String(dateNueva.getUTCHours()).padStart(2, '0')}:${String(dateNueva.getUTCMinutes()).padStart(2, '0')}`;

      // Usamos el método limpio que definimos antes
      const slotNuevo = await this.slotRepository.findByMedicFechaHora(idMedico, fechaNuevaStr, horaNuevaStr);

      if (!slotNuevo) {
        throw new ConflictError('El horario de la propuesta ya no se encuentra disponible.');
      }

      slotNuevo.estado = 'RESERVADO';
      slotNuevo.turnoAsociado = turno.id || turno._id;
      await this.slotRepository.save(slotNuevo);

      // --- PASO C: EFECTUAR CAMBIO EN EL TURNO ---
      turno.fechaHora = dateNueva;

      const notificacion = turno.actualizarEstado(
        usuario,
        new Reservado(turno),
        'Propuesta de reprogramación aceptada con éxito',
      );

      if (notificacion) {
        await this.notificacionRepository.save(notificacion);
      }

    } else {
      // Si se rechaza, vuelve a RESERVADO con su fecha vieja intacta y no tocamos ningún slot
      const notificacion = turno.actualizarEstado(
        usuario,
        new Reservado(turno),
        'Propuesta de reprogramación rechazada por la contraparte',
      );

      if (notificacion) {
        await this.notificacionRepository.save(notificacion);
      }
    }

    // 5. Limpiamos la propuesta ya resuelta y guardamos todo
    turno.propuestaCambio = null;
    await this.turnoRepository.save(turno);
    
    return turno;
  }

  obtenerHoraInicio(fecha) {
    const inicioDeMañana = new Date(fecha);
    inicioDeMañana.setDate(fecha.getDate() + 1);
    return inicioDeMañana.setHours(0, 0, 0, 0);
  }

  obtenerHoraFin(fecha) {
    const finDeMañana = new Date(fecha);
    finDeMañana.setDate(fecha.getDate() + 1);
    return finDeMañana.setHours(23, 59, 59, 999);
  }

  async obtenerTurnosParaManiana() {
    const hoy = new Date();

    const horaInicioManiana = this.obtenerHoraInicio(hoy);
    const horaFinManiana = this.obtenerHoraFin(hoy);

    return this.turnoRepository.findAllForTomorrow(horaInicioManiana, horaFinManiana);
  }
}

export const turnoService = new TurnoService();

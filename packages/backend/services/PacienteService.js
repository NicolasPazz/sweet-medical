import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { turnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { NotFoundError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';
import { logger } from '../utils/logger.js';
import { usuarioService } from './UsuarioService.js';
import { DateUtil } from '../utils/DateUtil.js';

export class PacienteService {
  constructor({
    pacienteRepository: pacienteRepo = pacienteRepository,
    turnoRepository: turnoRepo = turnoRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.pacienteRepository = pacienteRepo;
    this.turnoRepository = turnoRepo;
    this.usuarioService = usuarioSvc;
  }

  async findById(id) {
    return await this.pacienteRepository.findById(id);
  }

  async findByIdUsuario(usuarioId) {
    return await this.pacienteRepository.findByIdUsuario(usuarioId);
  }

  async findByDniPaciente(dni) {
    return await this.usuarioService.findByDni(dni);
  }

  async findByUsuarioId(usuarioId) {
    return await this.pacienteRepository.findByIdUsuario(usuarioId);
  }

  async crearPaciente({ usuario, nombre, obraSocial, plan }) {
    if (!usuario) {
      throw new Error('El usuario es obligatorio para crear un paciente');
    }

    const usuarioId = usuario?._id ?? usuario?.id ?? usuario;

    return await this.pacienteRepository.save({
      usuario: usuarioId,
      nombre: nombre,
      obraSocial: obraSocial,
      plan: plan,
    });
  }

  async leerTodos() {
    return await this.pacienteRepository.findAll();
  }

  async obtenerHistorialTurnosDni(dni) {
    const usuario = await this.findByDniPaciente(dni);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return this.obtenerHistorialTurnosIdUsuario(usuario.id);
  }

  async obtenerHistorialTurnosIdUsuario(idUsuario) {
    const paciente = await this.findByIdUsuario(idUsuario);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }
    return this.obtenerHistorialTurnos(paciente);
  }

  async obtenerHistorialTurnos(paciente) {

    const turnos = await this.turnoRepository.findAllByPatientId(paciente.id || paciente._id);

    const turnosFormateados = turnos.map((t) => {
      const esPractica = !!t.servicio?.codigo;
      // 'esTipo' ya no se parchea acá: ahora vive directamente en el sub-schema
      // del servicio embebido (ver TurnoSchema.js), así que t.servicio.esTipo()
      // funciona nativamente para cualquier turno persistido.
      const turnoAdaptado = {
        ...t,
        practica: esPractica ? t.servicio : null,
        especialidad: !esPractica ? t.servicio : null,
        servicio: t.servicio,
      };

      let cobertura;
      let costoEstimado = t.costo;
      try {
        const resultado = MotorCostos.calcularPara(turnoAdaptado, paciente);
        cobertura = resultado.tipoCobertura;
        costoEstimado = resultado.costoEstimado;
      } catch (error) {
        logger.error('Error calculando cobertura para turno', t.id || t._id, ':', error.message);
      }

      const historialTurnos = Array.isArray(t.historialEstados)
        ? t.historialEstados.map((h) => ({
          id_cambio: h._id || h.id,
          fechaHoraIngreso: h.fechaHoraIngreso,
          estado: h.estado,
          motivo: h.motivo,
          usuario: h.usuario
            ? {
              id: h.usuario._id || h.usuario.id || h.usuario,
              nombre: h.usuario.nombre || null,
              email: h.usuario.email || null,
            }
            : null,
        }))
        : [];

      return {
        _id: t.id || t._id,
        id_turno: t.id || t._id,
        fechaHora: t.fechaHora ? t.fechaHora : 'N/A',
        diaSemana: t.diaSemana,
        hora: t.hora,
        medico: t.medico ? t.medico.nombre : 'N/A',
        medico_id: t.medico ? String(t.medico.id || t.medico._id) : null,
        servicio: t.servicio
          ? t.servicio.codigo
            ? `${t.servicio.codigo} - ${t.servicio.nombre}`
            : t.servicio.nombre
          : 'N/A',
        // IDs necesarios para poder consultar disponibilidad real al reprogramar
        // (ver ReprogramarTurno.jsx / ModalReprogramacion): antes esto solo
        // tenía strings de display, sin forma de volver a pedirle al backend
        // "qué horarios hay libres" para este mismo médico+servicio.
        servicio_id: t.servicio ? String(t.servicio._id) : null,
        servicio_tipo: t.servicio?.esTipo
          ? t.servicio.esTipo()
          : esPractica
            ? 'PRACTICA'
            : 'ESPECIALIDAD',
        sede: t.sede ? t.sede.nombre : 'N/A',
        estado:
          typeof t.estado?.getEstadoNombre === 'function'
            ? t.estado.getEstadoNombre()
            : t.estado || 'N/A',
        costo: t.costo,
        costoEstimado: costoEstimado,
        cobertura: cobertura,
        historialTurnos,
        // Antes este mapeo no devolvía nada de la propuesta de reprogramación:
        // el paciente perdía por completo la tarjeta de "Propuesta del médico" /
        // "Tu propuesta" apenas se refrescaba la página (la primera carga usaba
        // el estado local optimista, pero el refetch a este endpoint no traía
        // el campo). Mismo criterio que TurnoService._mapearTurno.
        propuestaCambio:
          t.propuestaCambio && t.propuestaCambio.nuevaFechaHora
            ? {
              nuevaFechaHora: t.propuestaCambio.nuevaFechaHora,
              nuevaHora: DateUtil.toHHMM(t.propuestaCambio.nuevaFechaHora),
              motivo: t.propuestaCambio.motivo,
              proponenteId: t.propuestaCambio.proponenteId,
            }
            : null,
      };
    });

    const pacienteFormateado = {
      id_usuario: paciente.usuario?._id || paciente.usuario?.id || paciente.usuario,
      id_paciente: paciente.id || paciente._id,
      nombre: paciente.nombre,
      dni: paciente.dni,
      obraSocial: paciente.obraSocial ? paciente.obraSocial.nombre : 'N/A',
      plan: paciente.plan ? paciente.plan.nombre : 'N/A',
    };
    return {
      paciente: pacienteFormateado,
      turnos: turnosFormateados,
    };
  }
}

export const pacienteService = new PacienteService();

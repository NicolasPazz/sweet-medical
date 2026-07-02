import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { turnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';
import { usuarioService } from './UsuarioService.js';

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

  async crearPaciente({ usuario, nombre }) {
    if (!usuario) {
      throw new Error('El usuario es obligatorio para crear un paciente');
    }

    const usuarioId = usuario?._id ?? usuario?.id ?? usuario;

    return await this.pacienteRepository.save({
      usuario: usuarioId,
      nombre: nombre
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


    console.log("paciente: " + paciente.id);

    const turnos = await this.turnoRepository.findAllByPatientId(paciente.id || paciente._id);
    console.log("TURNOS: " + turnos);
    const turnosFormateados = turnos.map((t) => {
      const esPractica = !!t.servicio?.codigo;
      const turnoAdaptado = {
        ...t,
        practica: esPractica ? t.servicio : null,
        especialidad: !esPractica ? t.servicio : null,
      };

      let cobertura;
      let costoEstimado = t.costo;
      try {
        const resultado = MotorCostos.calcularPara(turnoAdaptado, paciente);
        cobertura = resultado.tipoCobertura;
        costoEstimado = resultado.costoEstimado;
      } catch (error) {
        console.log('Error calculando cobertura para turno', t.id || t._id, ':', error.message);
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
        id_turno: t.id || t._id,
        fechaHora: t.fechaHora ? t.fechaHora : 'N/A',
        diaSemana: t.diaSemana,
        hora: t.hora,
        medico: t.medico ? t.medico.nombre : 'N/A',
        servicio: t.servicio
          ? t.servicio.codigo
            ? `${t.servicio.codigo} - ${t.servicio.nombre}`
            : t.servicio.nombre
          : 'N/A',
        sede: t.sede ? t.sede.nombre : 'N/A',
        estado:
          typeof t.estado?.getEstadoNombre === 'function'
            ? t.estado.getEstadoNombre()
            : t.estado || 'N/A',
        costo: t.costo,
        costoEstimado: costoEstimado,
        cobertura: cobertura,
        historialTurnos,
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
    console.log("TURNOS FORMATEADOS: " + turnosFormateados);
    return {
      paciente: pacienteFormateado,
      turnos: turnosFormateados,
    };
  }
}

export const pacienteService = new PacienteService();

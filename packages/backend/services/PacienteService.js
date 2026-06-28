import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';

export class PacienteService {
  constructor({ pacienteRepository: pacienteRepo = pacienteRepository } = {}) {
    this.pacienteRepository = pacienteRepo;
  }

  async findById(id) {
    return await this.pacienteRepository.findById(id);
  }

  async findByIdUsuario(usuarioId) {
    return await this.pacienteRepository.findByIdUsuario(usuarioId);
  }

  async findByDniPaciente(dni) {
    return await this.pacienteRepository.findByDniPaciente(dni);
  }

  async findByUsuarioId(usuarioId) {
    return await this.pacienteRepository.findByIdUsuario(usuarioId);
  }

  async crearPaciente({ usuario }) {
    if (!usuario) {
      throw new Error('El usuario es obligatorio para crear un paciente');
    }

    const usuarioId = usuario?._id ?? usuario?.id ?? usuario;

    return await this.pacienteRepository.save({
      usuario: usuarioId,
    });
  }

  async leerTodos() {
    return await this.pacienteRepository.findAll();
  }

  async obtenerHistorialTurnos(id) {
    const paciente = await this.pacienteRepository.findByIdUsuario(id);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    const turnos = await this.turnoService.findAllByPatientId(paciente.id || paciente._id);

    return turnos.map((t) => {
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
  }
}

export const pacienteService = new PacienteService();

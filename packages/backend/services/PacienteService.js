import { TurnoRepository } from '../infrastructure/repositories/TurnoRepository.js';
import { PacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { NotFoundError } from '../errors/AppError.js';
import { MotorCostos } from '../domain/cobertura/MotorCostos.js';

export class PacienteService {
  constructor({
    turnoRepository = new TurnoRepository(),
    pacienteRepository = new PacienteRepository(),
  } = {}) {
    this.turnoRepository = turnoRepository;
    this.pacienteRepository = pacienteRepository;
  }

  async obtenerHistorialTurnos(id) {
    const paciente = await this.pacienteRepository.findByIdUsuario(id);
    if (!paciente) {
      throw new NotFoundError('Paciente no encontrado');
    }

    const turnos = await this.turnoRepository.findAllByPatientId(paciente.id || paciente._id);

    const motorCostos = new MotorCostos();

    return turnos.map((t) => {
      const esPractica = !!t.servicio?.codigo;
      const turnoAdaptado = {
        ...t,
        practica: esPractica ? t.servicio : null,
        especialidad: !esPractica ? t.servicio : null,
      };

      let cobertura;
      try {
        const resultado = motorCostos.calcularPara(turnoAdaptado, paciente);
        cobertura = resultado.tipoCobertura;
      } catch (error) {
        console.log('Error calculando cobertura para turno', t.id || t._id, ':', error.message);
      }

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

        cobertura: cobertura,
      };
    });
  }
}

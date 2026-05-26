import { DateUtil } from '../../../utils/DateUtil.js';

export class TurnoMapper {
  static toResponseDTO(turno, costoCalculado) {
    const fecha = DateUtil.toYYYYMMDD(turno.fechaHora || turno.fecha);
    const hora = DateUtil.toHHMM(turno.fechaHora || turno.hora);

    return {
      id: turno.id || turno._id,
      medico: turno.medico
        ? {
            id: turno.medico.id || turno.medico._id || turno.medico,
            nombre: turno.medico?.nombre || 'No especificado',
          }
        : null,
      fecha,
      hora,
      sede: turno.sede
        ? {
            id: turno.sede?.id || turno.sede?._id,
            nombre: turno.sede?.nombre,
          }
        : null,
      practica: turno.practica?.nombre || null,
      especialidad: turno.especialidad?.nombre || null,
      estado: turno.estado,
      cobertura: costoCalculado?.tipoCobertura, //mostrar si está cubierta y cuánto paga el paciente (el costo calculado en tiempo real)
      costoEstimado: costoCalculado?.costoEstimado,
    };
  }
}

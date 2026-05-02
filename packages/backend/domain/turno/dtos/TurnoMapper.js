export class TurnoMapper {
  static toResponseDTO(turno, costoCalculado) {
    const fechaObj = new Date(turno.fechaHora);
    const fecha = isNaN(fechaObj.getTime()) ? null : fechaObj.toISOString().split('T')[0];
    const hora = isNaN(fechaObj.getTime()) ? null : fechaObj.toISOString().split('T')[1].substring(0, 5);

    return {
      id: turno.id || turno._id,
      medico: turno.medico ? {
        id: turno.medico.id || turno.medico._id || turno.medico,
        nombre: turno.medico?.nombre || 'No especificado',
      } : null,
      fecha,
      hora,
      sede: turno.sede ? {
        id: turno.sede?.id || turno.sede?._id,
        nombre: turno.sede?.nombre,
      } : null,
      practica: turno.practica?.nombre || null,
      especialidad: turno.especialidad?.nombre || null,
      estado: turno.estado,
      cobertura: costoCalculado?.tipoCobertura, //mostrar si está cubierta y cuánto paga el paciente (el costo calculado en tiempo real)
      costoEstimado: costoCalculado?.costoEstimado,
    };
  }
}

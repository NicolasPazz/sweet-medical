import { CambioEstadoTurno } from './CambioEstadoTurno.js';
import { PendienteReprogramacion } from '../notificacion/estado-turno/PendienteReprogramacion.js';
import { FactoryNotificacion } from '../notificacion/FactoryNotificacion.js';
import { logger } from '../../utils/logger.js';
import { DateUtil } from '../../utils/DateUtil.js';

export class Turno {
  id;
  medico;
  paciente;
  fechaHora;
  sede;
  servicio;
  estado;
  historialEstados;
  costo;
  hora;
  slotsAsociados;
  propuestaCambio = null;

  constructor(medico, paciente, fecha, horaInicio, sede, servicio, costo) {
    this.medico = medico;
    this.paciente = paciente;
    this.fechaHora = Turno.combinarFechaYHoraUTC(fecha, horaInicio);
    this.hora = horaInicio;
    this.sede = sede;
    // OJO: no usar `servicio?.costo ? servicio : null` acá. Un servicio con
    // costo=0 (ej: consulta gratuita, promoción) es válido y NO debería
    // descartarse solo porque su precio es un valor falsy en JS. Lo único que
    // importa acá es si el servicio existe.
    this.servicio = servicio ?? null;
    this.historialEstados = [];
    this.costo = costo;
    this.slotsAsociados = [];
  }

  /**
   * Combina la parte de FECHA de `fecha` (se descarta cualquier hora que ya
   * viniera pegada ahí, como el sufijo "T08:00:00Z" que arma Agenda.js) con
   * `horaInicio` ("HH:MM"). Ambos representan siempre hora UTC: la
   * disponibilidad del médico se persiste en UTC (convertida desde el
   * navegador que la cargó, ver `MedicoService.actualizarDisponibilidad`), y
   * los Slots se generan directamente a partir de esa disponibilidad, así que
   * ya llegan en UTC sin conversión adicional acá.
   */
  static combinarFechaYHoraUTC(fecha, horaInicio) {
    const fechaStr =
      fecha instanceof Date ? fecha.toISOString().split('T')[0] : String(fecha).split('T')[0];

    const horaValida = horaInicio && /^\d{2}:\d{2}$/.test(horaInicio) ? horaInicio : '00:00';

    return new Date(`${fechaStr}T${horaValida}:00Z`);
  }

  actualizarEstado(usuario, nuevoEstado, motivo) {

    const estadoEnum = nuevoEstado.getEstadoNombre();

    const nuevoCambio = new CambioEstadoTurno(estadoEnum, this, usuario, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(usuario, this, motivo);
    return notificacion;
  }

  solicitarReprogramacion(usuario, nuevaFechaHora, motivo) {
    this.propuestaCambio = {
      nuevaFechaHora,
      motivo,
      proponenteId: usuario.id || usuario._id,
    };


    console.log("usuario: ", usuario);
    console.log("nuevaFechaHora: ",nuevaFechaHora);
    console.log("motivo: ", motivo);

    const notificacion = this.actualizarEstado(
      usuario,
      new PendienteReprogramacion(this),
      `Solicitud de reprogramación para el ${DateUtil.toDDMMYYYY(nuevaFechaHora)}`,
    );

    return notificacion;
  }

  obtenerNombreServicio() {
    return this.servicio ? this.servicio.nombre : null;
  }

  obtenerUltimoActor() {
    if (!this.historialEstados || this.historialEstados.length === 0) {
      logger.warn(`Turno ${this.id} no tiene historial de estados para obtener el último actor.`);
      return null;
    }
    return this.historialEstados[this.historialEstados.length - 1].usuario;
  }
}

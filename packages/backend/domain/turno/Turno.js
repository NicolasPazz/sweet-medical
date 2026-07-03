import { CambioEstadoTurno } from './CambioEstadoTurno.js';
import { PendienteReprogramacion } from '../notificacion/estado-turno/PendienteReprogramacion.js';
import { FactoryNotificacion } from '../notificacion/FactoryNotificacion.js';
import { logger } from '../../utils/logger.js';

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
    this.fechaHora = new Date(fecha);
    this.hora = horaInicio;
    this.sede = sede;
    this.servicio = servicio?.costo ? servicio : null;
    this.historialEstados = [];
    this.costo = costo;
    this.slotsAsociados = [];
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

    const notificacion = this.actualizarEstado(
      usuario,
      new PendienteReprogramacion(this),
      `Solicitud de reprogramación para el ${nuevaFechaHora.toLocaleDateString('es-AR')}`,
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

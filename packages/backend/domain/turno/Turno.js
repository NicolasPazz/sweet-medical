import { CambioEstadoTurno } from './CambioEstadoTurno.js';
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
  
  actualizarEstado(quien, nuevoEstado, motivo) {
    console.log('QUIEN LLAMA? ', quien);

    const estadoEnum = typeof nuevoEstado.getEstadoNombre === 'function' ? nuevoEstado.getEstadoNombre() : nuevoEstado.constructor.name.toUpperCase();

    const nuevoCambio = new CambioEstadoTurno(estadoEnum, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(quien, this);
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

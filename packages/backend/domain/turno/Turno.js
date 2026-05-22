import { CambioEstadoTurno } from './CambioEstadoTurno.js';
import { Disponible } from '../notificacion/estado-turno/Disponible.js';
import { PendienteReprogramacion } from '../notificacion/estado-turno/PendienteReprogramacion.js';
import { FactoryNotificacion } from '../notificacion/FactoryNotificacion.js';
import { logger } from '../../utils/logger.js';
import { Usuario } from '../usuario/Usuario.js';

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
  diaSemana;
  hora;
  propuestaCambio = null;

  constructor(medico, paciente, diaSemana, hora, sede, servicio, costo, usuarioSistema) {
    this.medico = medico;
    this.paciente = paciente;
    this.diaSemana = diaSemana;
    this.hora = hora;
    this.sede = sede;
    this.servicio = servicio?.costo ? servicio : null;
    this.historialEstados = [];
    this.costo = costo;

    this.actualizarEstado(usuarioSistema, new Disponible(this), 'Turno generado');
  }

  actualizarEstado(quien, nuevoEstado, motivo) {
    console.log('QUIEN LLAMA? ', quien);

    const estadoEnum =
      typeof nuevoEstado.getEstadoNombre === 'function'
        ? nuevoEstado.getEstadoNombre()
        : nuevoEstado.constructor.name.toUpperCase();

    const nuevoCambio = new CambioEstadoTurno(estadoEnum, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(quien, this);
    return notificacion;
  }

  solicitarReprogramacion(usuarioQueLlama, nuevaFechaHora, motivo) {
    this.propuestaCambio = {
      nuevaFechaHora,
      motivo,
      proponenteId: usuarioQueLlama.id || usuarioQueLlama._id,
    };

    const notificacion = this.actualizarEstado(
      usuarioQueLlama,
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

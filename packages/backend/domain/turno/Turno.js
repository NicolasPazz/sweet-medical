import { CambioEstadoTurno } from './CambioEstadoTurno.js';
import { Disponible } from '../notificacion/estado-turno/Disponible.js';
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

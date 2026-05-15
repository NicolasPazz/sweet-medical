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

  constructor(medico, paciente, diaSemana, hora, sede, servicio, costo) {
    this.medico = medico;
    this.paciente = paciente;
    this.diaSemana = diaSemana;
    this.hora = hora;
    this.sede = sede;
    this.servicio = servicio.costo ? servicio : null;
    this.historialEstados = [];
    this.costo = costo;

    this.actualizarEstado(new Disponible(this), Usuario.USUARIO_SISTEMA, 'Turno generado');
  }

  actualizarEstado(nuevoEstado, quien, motivo) {
    const nuevoCambio = new CambioEstadoTurno(nuevoEstado, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    logger.debug(
      `Turno ${this.id} actualizado a estado ${nuevoEstado.constructor.name} por ${quien.nombreUsuario} con motivo: ${motivo}`,
    );

    // Esta funcion debe devolver void, esto se hará en un service mas adelante
    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(this);
    return notificacion;
  }

  obtenerNombreServicio() {
    return this.servicio ? this.servicio.nombre : null;
  }

  obtenerUltimoActor() {
    if (this.historialEstados.length === 0) {
      logger.warn(`Turno ${this.id} no tiene historial de estados para obtener el último actor.`);
      return null;
    }
    return this.historialEstados[this.historialEstados.length - 1].usuario;
  }
}

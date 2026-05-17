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

  // Modificado: Ahora recibe un objeto con propiedades para mapeo directo de base de datos/JSON
  constructor({
    id,
    medico,
    paciente,
    diaSemana,
    hora,
    sede,
    servicio,
    costo,
    fechaHora,
    historialEstados = [],
    admin
  }) {
    this.id = id;
    this.medico = medico;
    this.paciente = paciente;
    this.diaSemana = diaSemana;
    this.hora = hora;
    this.sede = sede;
    this.fechaHora = fechaHora;
    this.servicio = servicio?.costo ? servicio : servicio; // Flexibilidad si ya viene instanciado
    this.historialEstados = historialEstados;
    this.costo = costo;
    this.actualizarEstado(admin, new Disponible(this), admin, "Turno generado");
  }

  // En Turno.js, agregás este método estático:

  actualizarEstado(usuarioQueLlama, nuevoEstado, quien, motivo) {
    logger.debug('USUARIO QUE LLAMA (deberia ser admin:', usuarioQueLlama);
    logger.debug('nuevoEstado:', nuevoEstado);
    logger.debug('quien:', quien);
    logger.debug('motivo:', motivo);

    const nuevoCambio = new CambioEstadoTurno(nuevoEstado, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    // Corregido: Usamos coma en lugar de concatenar con '+' para evitar el [object Object] en el logger
    logger.debug(
      `Turno ${this.id} actualizado a estado ${nuevoEstado.constructor.name} por con motivo: ${motivo}`,
      quien,
    );

    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(usuarioQueLlama, this);
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

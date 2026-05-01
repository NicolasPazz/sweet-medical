import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { Disponible } from "./notificacion/estado-turno/Disponible.js";
import { FactoryNotificacion } from "../notificacion/FactoryNotificacion.js";
import { logger } from "../../utils/logger.js";

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

  constructor(medico, paciente, fechaHora, sede, servicio, costo) {
    this.medico = medico;
    this.paciente = paciente;
    this.fechaHora = fechaHora;
    this.sede = sede;
    this.servicio = servicio.costo ? servicio : null;
    this.estado = new Disponible();
    this.historialEstados = [];
    this.costo = costo;
  }

  actualizarEstado(nuevoEstado, quien, motivo) {
    const nuevoCambio = new CambioEstadoTurno(nuevoEstado, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;
    logger.debug(
      `Turno ${this.id} actualizado a estado ${nuevoEstado} por ${quien.nombre} con motivo: ${motivo}`
    );

    // Esta funcion debe devolver void, esto se hará en un service mas adelante
    const notificacion = FactoryNotificacion.crearSegunEstadoTurno(this);
    return notificacion;
  }

  obtenerNombreServicio() {
    return this.practica ? this.practica.nombre : this.especialidad.nombre;
  }

  obtenerUltimoActor() {
    if (this.historialEstados.length === 0) {
      logger.warn(`Turno ${this.id} no tiene historial de estados para obtener el último actor.`);
      return null;
    }
    return this.historialEstados[this.historialEstados.length - 1].usuario;
  }
}

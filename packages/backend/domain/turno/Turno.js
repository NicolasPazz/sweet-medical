import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { Disponible } from "./notificacion/estado-turno/Disponible.js";
import { FactoryNotificacion } from "../notificacion/FactoryNotificacion.js";
import { logger } from "../../utils/logger.js";
import { tLog } from "../../utils/i18n/i18n.js";

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
    this.estado = new Disponible();
    this.historialEstados = [];
    this.costo = costo;
  }

  actualizarEstado(nuevoEstado, quien, motivo) {
    const nuevoCambio = new CambioEstadoTurno(nuevoEstado, this, quien, motivo);
    this.historialEstados.push(nuevoCambio);
    this.estado = nuevoEstado;

    logger.debug(
      tLog('LOG_TURNO_ACTUALIZADO', {
        id: this.id,
        estado: nuevoEstado.constructor.name,
        quien: quien.nombre,
        motivo: motivo || 'N/A'
      })
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
      logger.warn(
        tLog('LOG_TURNO_SIN_HISTORIAL', { id: this.id })
      );
      return null;
    }
    return this.historialEstados[this.historialEstados.length - 1].usuario;
  }
}
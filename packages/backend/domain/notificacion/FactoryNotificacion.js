import { EstadoTurno } from "../turno/EstadoTurno.js";
import { Notificacion } from "./Notificacion.js";
import { Usuario } from "../usuarios/Usuario.js";
import { logger } from "../../utils/logger.js";

export class FactoryNotificacion {
  static crearSegunEstadoTurno(turno) {
    const servicio = turno.obtenerNombreServicio();
    const actor = turno.obtenerUltimoActor();
    const remitente = Usuario.USUARIO_SISTEMA;

    switch (turno.estado) {
      case EstadoTurno.RESERVADO:
        // Se notifica al médico indicando paciente y servicio solicitado (especialidad o práctica).
        logger.debug(
          `Creando notificación para turno ${turno.id} en estado RESERVADO por paciente ${turno.paciente.nombre} para servicio ${servicio}.`
        );
        return new Notificacion(
          Date.now().toString(),
          turno.medico.usuario,
          remitente,
          `Nuevo turno reservado por paciente ${turno.paciente.nombre} para ${servicio}.`
        );

      case EstadoTurno.CONFIRMADO:
        // Al aceptar un turno, se notifica al paciente.
        logger.debug(
          `Creando notificación para turno ${turno.id} en estado CONFIRMADO por profesional ${turno.medico.nombre} para servicio ${servicio}.`
        );
        return new Notificacion(
          Date.now().toString(),
          turno.paciente.usuario,
          remitente,
          `Su turno para ${servicio} el dia ${turno.fechaHora} en ${turno.sede.nombre} con el Dr/a. ${turno.medico.nombre} ha sido confirmado.`
        );

      case EstadoTurno.CANCELADO:
        // Ante cancelaciones de turnos, se notifica a la contraparte correspondiente.
        if (actor && actor.id === turno.paciente.usuario.id) {
          logger.debug(
            `Creando notificación para turno ${turno.id} en estado CANCELADO por paciente ${turno.paciente.nombre} para servicio ${servicio}.`
          );
          return new Notificacion(
            Date.now().toString(),
            turno.medico.usuario,
            remitente,
            `El paciente ${turno.paciente.nombre} ha cancelado su turno para ${servicio}.`
          );
        } else {
          logger.debug(
            `Creando notificación para turno ${turno.id} en estado CANCELADO por profesional ${turno.medico.nombre} para servicio ${servicio}.`
          );
          return new Notificacion(
            Date.now().toString(),
            turno.paciente.usuario,
            remitente,
            `El profesional ha cancelado su turno del dia ${turno.fechaHora} en ${turno.sede.nombre} para ${servicio}.`
          );
        }

      default:
        // Si el estado es DISPONIBLE o REALIZADO, no hay notificación
        logger.debug(`No se crea notificación para turno ${turno.id} en estado ${turno.estado}.`);
        return null;
    }
  }

  // Esto se ejecutara desdes un cron
  static crearRecordatoriosDiaPrevio(turno) {
    const remitente = Usuario.USUARIO_SISTEMA;
    return [
      new Notificacion(
        Date.now().toString(),
        turno.medico.usuario,
        remitente,
        `Recordatorio: Mañana tiene un turno con ${turno.paciente.nombre}.`
      ),
      new Notificacion(
        Date.now().toString(),
        turno.paciente.usuario,
        remitente,
        `Recordatorio: Mañana es su turno con el Dr/a. ${turno.medico.nombre}.`
      ),
    ];
  }
}

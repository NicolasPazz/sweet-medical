import { Turno } from "../turno/Turno.js";
import { EstadoTurno } from "../turno/EstadoTurno.js";
import { Notificacion } from "./Notificacion.js";

export class FactoryNotificacion {

    crearSegunEstadoTurno(turno) {
        const notificacionADevolver = new Notificacion();
        switch (turno.estado) {
            case EstadoTurno.DISPONIBLE:
                notificacionADevolver.mensaje = "Su turno esta reservado";
                break;
            case EstadoTurno.CONFIRMADO:
                notificacionADevolver.mensaje = "Su turno esta confirmado";
                break;
            case EstadoTurno.RESERVADO:
                notificacionADevolver.mensaje = "Su turno está reservado";
                break;
            case EstadoTurno.CANCELADO:
                notificacionADevolver.mensaje = "Su turno fue cancelado";
                break;
            case EstadoTurno.REALIZADO:
                notificacionADevolver.mensaje = "Su turno fue realizado";
                break;
    }
    return notificacionADevolver;
    }
}
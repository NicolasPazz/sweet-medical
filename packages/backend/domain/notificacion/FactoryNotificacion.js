import { Turno } from "../turno/Turno.js";
import { EstadoTurno } from "../turno/EstadoTurno.js";
import { Notificacion } from "./Notificacion.js";

export class FactoryNotificacion {

    crearSegunEstadoTurno(turno) {
        let mensaje = "";
        const notificacionADevolver = new Notificacion();
        switch (turno.estado) {
            case EstadoTurno.DISPONIBLE:
                notificacionADevolver.mensaje = "Su turno esta reservado"
                break;
            case EstadoTurno.CONFIRMADO:
            CASE EstadoTurn
Toda
    }
    return notificacionADevolver;
}
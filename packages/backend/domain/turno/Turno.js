import { CambioEstadoTurno } from "./CambioEstadoTurno.js";
import { EstadoTurno } from "../enum/EstadoTurno.js";

export class Turno{
    constructor(id, medico, paciente, fechaHora, sede, practica, costo, especialidad) {
        this.id = id;
        this.medico = medico;
        this.paciente = paciente;
        this.fechaHora = fechaHora;
        this.sede = sede;
        this.practica = practica;
        this.especialidad = especialidad;
        this.costo = costo;
        this.estado = EstadoTurno.DISPONIBLE; 
        this.historialEstados = [];
    }

    actualizarEstado(nuevoEstado,quien,motivo){
        const nuevoCambio = new CambioEstadoTurno(
            new Date(),
            nuevoEstado,
            this,
            quien,
            motivo
        );
        this.historialEstados.push(nuevoCambio);
        this.estado = nuevoEstado;
    }
}
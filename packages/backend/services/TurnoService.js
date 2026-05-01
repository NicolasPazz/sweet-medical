import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { PacienteRepository } from "../repositories/PacienteRepository.js";
import { Reservado } from "../domain/notificacion/estado-turno/Reservado.js"
import { configurarFecha } from "../domain/utils/functions.js";

export class TurnoService{

    turnoRepository;
    pacienteRepository;

    constructor({turnoRepository = new TurnoRepository()} = {}, {pacienteRepository = new PacienteRepository()} = {}){
        this.turnoRepository = turnoRepository;
        this.pacienteRepository = pacienteRepository;
    }

    reservarTurno(id_paciente, id_turno){

        const paciente = this.pacienteRepository.findById(id_paciente);

        if(paciente == null){
            return { status: 404, data : "Paciente no encontrado"};
        }

        const turno = this.turnoRepository.findById(id_turno);

        if(turno == null){
            return { status: 404, data : "Turno no encontrado"};
        }

        turno.paciente = paciente;

        turno.fechaHora = configurarFecha(turno.fechaHora); //TODO falta la logica de que si por ejemplo el martes proximo hay un turno que ya se solapa con este turno, ir al proximo martes disponible

        turno.actualizarEstado(new Reservado, paciente, "Reserva de turno");

        this.turnoRepository.save(turno);

        return {status: 201};
    }

}
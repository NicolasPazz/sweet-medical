import { TurnoRepository } from "../repositories/TurnoRepository.js";
import { UsuarioRepository } from "../repositories/UsuarioRepository.js";
import { NotificacionRepository } from "../repositories/NotificacionRepository.js";
import { Paciente } from "../domain/usuario/Paciente.js";
import { Medico } from "../domain/usuario/Medico.js";
import { Reservado } from "../domain/notificacion/estado-turno/Reservado.js";
import { Cancelado } from "../domain/notificacion/estado-turno/Cancelado.js";
import { Agenda } from "../domain/agenda/Agenda.js";
import { Disponible } from "../domain/notificacion/estado-turno/Disponible.js";

export class TurnoService{

    turnoRepository;
    pacienteRepository;

    constructor({turnoRepository = new TurnoRepository()} = {}, {notificacionRepository = new NotificacionRepository()} = {}, {usuarioRepository = new UsuarioRepository()} = {}){
        this.turnoRepository = turnoRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
    }

    reservarTurno(id_usuario, id_turno){

        const usuario = this.usuarioRepository.findById(id_usuario); // cambiar por usuarioRepository

        if(usuario == null){
            return { status: 404, data : "Usuario no encontrado"};
        }

        const paciente = usuario.roles.find(r => r instanceof Paciente);

        if(paciente == null){
            return { status: 404, data: "Paciente no encontrado"};
        }

        const turno = this.turnoRepository.findById(id_turno);

        if(turno == null){
            return { status: 404, data : "Turno no encontrado"};
        }

        if(!(turno.paciente == paciente)){
            return { status: 409, data: "El paciente no tiene el turno asignado"};
        }

        if(!(turno.estado instanceof Disponible)){
            return { status: 409, data: "Turno en estado no disponible"};
        }

        turno.paciente = paciente;

        turno.fechaHora = Agenda.generarFechaHora(turno.fechaHora);

        const notificacion = turno.actualizarEstado(new Reservado, paciente, "Reserva de turno");

        this.notificacionRepository.save(notificacion);
        this.turnoRepository.save(turno);

        return {status: 201};
    }

    cancelarTurno(id_usuario, id_turno, esMedico, motivo){
        const usuario = this.usuarioRepository.findById(id_usuario);

        if(usuario == null){
            return { status: 404, data : "Usuario no encontrado"};
        }

        const turno = this.turnoRepository.findById(id_turno);

        if(turno == null){
            return { status: 404, data : "Turno no encontrado"};
        }

        if(!(turno.estado instanceof Reservado)){
            return { status: 409, data: "No se puede cancelar el turno en este estado"};
        }
        
        if(!esMedico){
        const paciente = usuario.roles.find(r => r instanceof Paciente);
        
        if(paciente == null){
            return { status: 404, data: "Paciente no encontrado"};
        }

        if(!(turno.paciente == paciente)){
            return { status: 409, data: "El paciente no tiene el turno asignado"};
        }

        } else {
            
        const medico = usuario.roles.find(r => r instanceof Medico);
        
        if(medico == null){
            return { status: 404, data: "Medico no encontrado"};
        }

        if(!(turno.medico == medico)){
            return { status: 409, data: "El medico no tiene el turno asignado"};
        }

        }
        
        const unaHoraEnMs = 1000 * 60 * 60;
        if (turno.fechaHora - Date.now() < unaHoraEnMs) {
            return { status: 409, data: "Un turno no puede cancelarse con menos de 1 hora de antelación" };
        }

        const notificacion = turno.actualizarEstado(new Cancelado(), usuario, motivo);

        this.notificacionRepository.save(notificacion);
        this.turnoRepository.save(turno);

        return {status: 201};
    }

    obtenerHistorial(idPaciente, idUsuarioNum){
        const usuario = this.usuarioRepository.findById(idUsuarioNum);

        if(usuario == null){
            return { status: 404, data: "Recurso no encontrado"};
        }

        if(usuario.roles.filter(u => u instanceof Medico).length() == 0){
            return { status: 403, data : "No sos medico no tenes permiso!!!"};
        }

        const paciente = this.pacienteRepository.findById(idPaciente);

        if(paciente == null){
            return { status: 404, data: "Recurso no encontrado"};
        }

        const historial = this.turnoRepository.findAllByPatientId(idPaciente);

        return {status:201, data: historial};
    }
}
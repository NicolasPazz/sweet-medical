import { logger } from "../domain/utils/logger.js";
import { BadRequestError } from "../errors/AppError.js";
import { TurnoService } from "../services/TurnoService.js";

export class TurnoController{

    turnoService;

    constructor({turnoService = new TurnoService()} = {}){
        this.turnoService = turnoService;
    }


    /*
    Recibo: id_paciente, id_turno
    */
    reservarTurno = async (req, res) => {

        try {
            
            const { id_usuario, id_turno } = req.params;

            if (id_usuario === undefined || id_turno === undefined) {
            throw new BadRequestError("Parámetros incorrectos: id_usuario y/o id_turno es requerido");
            }

            const idUsuarioNum = Number(id_usuario);
            const idTurnoNum = Number(id_turno);

            if(!Number.isFinite(idUsuarioNum) || !Number.isFinite(idTurnoNum)){
                throw new BadRequestError("id_usuario y/o id_turno debe/n ser un número válido");
            }

            const respuesta = await this.turnoService.reservarTurno(idUsuarioNum, idTurnoNum);

            return res.status(respuesta.status || 200).json(respuesta.data || {});

        }
        catch(error){
            logger.error(error);

            return res.status(error.statusCode || 400).json({
            error: error.message || "Error interno del servidor"
        });
        }

    }


    cancelarTurnoPaciente = async (req, res) => {
        return this.cancelarTurno(req, res, false);
    }

    cancelarTurnoMedico = async (req, res) => {
        return this.cancelarTurno(req, res, true);
    }

    cancelarTurno = async (req, res, esMedico) => {

        try{

            const {id_usuario, id_turno} = req.query;
            const motivo = req.body.motivo;
            if (id_usuario === undefined || id_turno === undefined) {
            throw new BadRequestError("Parámetros incorrectos: id_usuario y/o id_turno es requerido");
            }

            const idUsuarioNum = Number(id_usuario);
            const idTurnoNum = Number(id_turno);

            if(!Number.isFinite(idUsuarioNum) || !Number.isFinite(idTurnoNum)){
                throw new BadRequestError("id_usuario y/o id_turno debe/n ser un número válido");
            }
            
            if (motivo == null){
                throw new BadRequestError("Debe escribir algún motivo")
            }

            const respuesta = await this.turnoService.cancelarTurno(idUsuarioNum, idTurnoNum, esMedico, motivo);

            return res.status(respuesta.status || 200).json(respuesta.data || {});
        }
        catch(error){
            logger.error(error);

            return res.status(error.statusCode || 400).json({
            error: error.message || "Error interno del servidor"
        });
        }
    }

    obtenerHistorial = async(req, res) => {
        try{
            const idPaciente = req.params.idPaciente;
            const idUsuario = req.params.idUsuario;
            if (idPaciente === undefined || idUsuario === undefined) {
                throw new BadRequestError("Parámetros incorrectos: idPaciente / idMedico es requerido");
            }

            const idPacienteNum = Number(idPaciente);
            const idUsuarioNum = Number(idUsuario);

            if(!Number.isFinite(idPacienteNum) || !Number.isFinite(idUsuarioNum)){
                throw new BadRequestError("idPaciente y/o idUsuario debe/n ser un número válido");
            }
            
            const respuesta = await this.turnoService.obtenerHistorial(idPacienteNum, idUsuarioNum);
            
            return res.status(respuesta.status || 200).json(respuesta.data || {});
            
        }
        catch(error){
            logger.error(error);

            return res.status(error.statusCode || 400).json({
            error: error.message || "Error interno del servidor"
        });
    } 

    }

    finalizarTurno = async(req, res) => {
        try{

            const id_usuario = req.params.id_usuario;
            const id_turno = req.params.id_turno;

            if (id_usuario === undefined || id_turno === undefined) {
                throw new BadRequestError("Parámetros incorrectos: id_usuario / id_turno es requerido");
            }

            const idUsuarioNum = Number(id_usuario);
            const idTurnoNum = Number(id_turno);

            if(!Number.isFinite(idUsuarioNum) || !Number.isFinite(idTurnoNum)){
                throw new BadRequestError("id_usuario y/o id_turno debe/n ser un número válido");
            }

            const respuesta = await this.turnoService.finalizarTurno(idUsuarioNum, idTurnoNum);

            return res.status(respuesta.status || 200).json(respuesta.data || {});
        }
        catch(error){
            logger.error(error);
            
            return res.status(error.statusCode || 400).json({
            error: error.message || "Error interno del servidor"
        });
        }



    }

    obtenerDisponibilidad = async(req, res) => {

        try{

            const id_usuario = req.params.id_usuario;
            const id_servicio = req.params.id_servicio;

            if (id_usuario === undefined || id_servicio === undefined) {
                throw new BadRequestError("Parámetros incorrectos: id_usuario / id_servicio es requerido");
            }

            const idUsuarioNum = Number(id_usuario);
            const idServicioNum = Number(id_servicio);

            if(!Number.isFinite(idUsuarioNum) || !Number.isFinite(idServicioNum)){
                throw new BadRequestError("id_usuario y/o id_servicio debe/n ser un número válido");
            }

            const respuesta = await this.turnoService.obtenerDisponibilidad(idUsuarioNum, idServicioNum);

            return res.status(respuesta.status || 200).json(respuesta.data || {});
        }
        catch(error){
            logger.error(error);
            
            return res.status(error.statusCode || 400).json({
            error: error.message || "Error interno del servidor"
        });
        }


    }

}
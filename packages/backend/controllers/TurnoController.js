import { logger } from "../domain/utils/logger.js";
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
            
            const { id_paciente, id_turno } = req.params;

            if (id_paciente === undefined || id_turno === undefined) {
            throw new Error("Parámetros incorrectos: id_paciente y/o id_turno es requerido");
            }

            const idPacienteNum = Number(id_paciente);
            const idTurnoNum = Number(id_turno);

            if(!Number.isFinite(idPacienteNum) || !Number.isFinite(idTurnoNum)){
                throw new Error("id_paciente y/o id_turno debe/n ser un número válido"); // TODO: Hacer AppError
            }

            const respuesta = await this.turnoService.reservarTurno(idPacienteNum, idTurnoNum);

            return res.status(respuesta.status || 200).json(respuesta.data || {});

        }
        catch(error){
            logger.error(error);

            return res.status(error.status || 400).json({
            error: error.message || "Error interno del servidor"
        });
        }

    }

}
import { logger } from "../domain/utils/logger.js";
import { PacienteService } from "../services/PacienteService.js";
import { pacienteRepository } from "../repositories/PacienteRepository.js";

export class PacienteController {
  constructor({ pacienteService = new PacienteService() } = {}) {
    this.pacienteService = pacienteService;
    this.pacienteRepository = pacienteRepository;
  }

  obtenerHistorial = async (req, res) => {
    try {
      // El diagrama de clases indica que el ID es String, pero si usas IDs numéricos mantén el Number()
      const idPaciente = req.params.id; 
      
      const resultado = await this.pacienteService.obtenerHistorialTurnos(idPaciente);
      
      return res.status(200).json({
        status: "success",
        data: resultado,
      });
    } catch (error) {
      logger.error("Error al obtener historial de paciente: " + error);
      return res.status(500).json({
        status: "error",
        message: "No se pudo recuperar el historial de turnos",
      });
    }
  };

  leerPacientes = async (req, res) => {

        try {

            const pacientes = await this.pacienteRepository.findAll();

            const dataParaEnviar = pacientes.map(m => ({
                id_usuario: m.usuario.id,
                id_paciente: m.id,
                nombre: m.nombre,
            }))

            return res.status(200).json({
                status: "success",
                data: dataParaEnviar
            })
        } catch (error) {
            logger.error(error);
        }


    }

}
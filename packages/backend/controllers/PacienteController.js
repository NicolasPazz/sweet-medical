import { PacienteService } from '../services/PacienteService.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class PacienteController {
  constructor({ pacienteService = new PacienteService() } = {}) {
    this.pacienteService = pacienteService;
    this.pacienteRepository = pacienteRepository;
  }

  obtenerHistorial = async (req, res, next) => {
    try {
      const idPaciente = req.params.id;

      ValidadorId.validarIds(idPaciente);

      const resultado = await this.pacienteService.obtenerHistorialTurnos(idPaciente);

      return res.status(200).json({
        status: 'success',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  leerPacientes = async (req, res, next) => {
    try {
      const pacientes = await this.pacienteRepository.findAll();

      const dataParaEnviar = pacientes.map((p) => ({
        id_usuario: p.usuario._id,
        id_paciente: p._id,
        nombre: p.nombre,
        dni: p.dni,
        obraSocial: p.obraSocial ? p.obraSocial.nombre : 'N/A',
        plan: p.plan ? p.plan.nombre : 'N/A',
      }));

      return res.status(200).json({
        status: 'success',
        data: dataParaEnviar,
      });
    } catch (error) {
      return next(error);
    }
  };
}

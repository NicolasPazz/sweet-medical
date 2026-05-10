import { PacienteService } from '../services/PacienteService.js';
import { pacienteRepository } from '../infrastructure/repositories/PacienteRepository.js';
import { ValidadorId } from '../domain/utils/ValidadorId.js';

export class PacienteController {
  constructor({ pacienteService = new PacienteService() } = {}) {
    this.pacienteService = pacienteService;
    this.pacienteRepository = pacienteRepository;
  }

  obtenerHistorial = async (req, res, next) => {
    try {
      const idPaciente = this.parsearId(req.params.id);

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
        id_usuario: p.usuario.id,
        id_paciente: p.id,
        nombre: p.nombre,
      }));

      return res.status(200).json({
        status: 'success',
        data: dataParaEnviar,
      });
    } catch (error) {
      return next(error);
    }
  };

  parsearId(valor) {
    const id = Number(valor);
    ValidadorId.validarIds(id);
    return id;
  }
}

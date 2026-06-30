import { pacienteService } from '../services/PacienteService.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class PacienteController {
  constructor({ pacienteService: svc = pacienteService } = {}) {
    this.pacienteService = svc;
  }

  obtenerHistorialMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const resultado = await this.pacienteService.obtenerHistorialTurnos(usuario.id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerHistorial = async (req, res, next) => {
    try {
      const idUsuario = req.params.id_usuario;

      ValidadorId.validarIds(idUsuario);

      const resultado = await this.pacienteService.obtenerHistorialTurnos(idUsuario);

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
      const pacientes = await this.pacienteService.leerTodos();

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

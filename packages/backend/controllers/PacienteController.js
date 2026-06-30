import { BadRequestError } from '../errors/AppError.js';
import { pacienteService } from '../services/PacienteService.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class PacienteController {
  constructor({ pacienteService: svc = pacienteService } = {}) {
    this.pacienteService = svc;
  }

  obtenerHistorialMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const resultado = await this.pacienteService.obtenerHistorialTurnos(usuario.dni);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerHistorial = async (req, res, next) => {
    try {
      const dni = req.params.dni;

      this.validarDNI(dni);

      const resultado = await this.pacienteService.obtenerHistorialTurnos(dni);

      return res.status(200).json({
        status: 'success',
        data: resultado,
      });
    } catch (error) {
      return next(error);
    }
  };

  validarDNI = (dni) => {

    if (!dni) throw new BadRequestError("No se ingreso el DNI o es invalido");

    const dniLimpio = String(dni).replaceAll(".", "").trim();

    const regexDNI = /^\d+$/;

    if (!regexDNI.test(dniLimpio)) {
    throw new BadRequestError("DNI no válido ingresado. Debe contener solo números y puntos.");
    }
  }

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

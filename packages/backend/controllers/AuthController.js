import { BadRequestError } from '../errors/AppError.js';
import { authService } from '../services/AuthService.js';

export class AuthController {
  constructor({ authService: svc = authService } = {}) {
    this.authService = svc;
  }

  /**
   * POST /auth/admin/crear-paciente
   * Body: { dni, nombre }
   */
  crearPacienteAdmin = async (req, res, next) => {
    try {
      const { dni, nombre } = req.body;
      if (!dni || !nombre) {
        throw new BadRequestError('dni y nombre son obligatorios');
      }
      const resultado = await this.authService.crearPacienteAdmin({ dni, nombre });
      return res.status(201).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /auth/admin/crear-medico
   * Body: { dni, nombre, matricula }
   */
  crearMedicoAdmin = async (req, res, next) => {
    try {
      const { dni, nombre, matricula } = req.body;
      if (!dni || !nombre || !matricula) {
        throw new BadRequestError('dni, nombre y matricula son obligatorios');
      }
      const resultado = await this.authService.crearMedicoAdmin({ dni, nombre, matricula });
      return res.status(201).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /auth/register
   * Body: { dni, email, password }
   */
  register = async (req, res, next) => {
    try {
      const { dni, email, password } = req.body;
      if (!dni || !email || !password) {
        throw new BadRequestError('dni, email y password son obligatorios');
      }
      const resultado = await this.authService.register({ dni, email, password });
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };
}

export const authController = new AuthController();
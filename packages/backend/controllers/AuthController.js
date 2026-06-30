import { BadRequestError } from '../errors/AppError.js';
import { authService } from '../services/AuthService.js';

export class AuthController {
  constructor({ authService: svc = authService } = {}) {
    this.authService = svc;
  }

  /**
   * POST /auth/register
   * Body: { dni, email, password }
   */
  register = async (req, res, next) => {
    try {
      const { dni, email, password, nombreUsuario, numTel, direccion, fechaNacimiento } = req.body;
      if (!dni || !email || !password) {
        throw new BadRequestError('dni, email y password son obligatorios');
      }
      const resultado = await this.authService.register({
        dni, email, password, nombreUsuario, numTel, direccion, fechaNacimiento,
      });
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new BadRequestError('Email y password son obligatorios');
      }

      await this.authService.login({ email, password });

      return res.status(200).send();
    } catch (error) {
      return next(error);
    }
  };


}

export const authController = new AuthController();
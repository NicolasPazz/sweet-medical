import { adminService } from '../services/AdminService.js';

export class AdminController {
  constructor({ adminService: svc = adminService } = {}) {
    this.adminService = svc;
  }

  /**
   * POST /admins/paciente
   * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
   * El perfil Paciente se crea vacío apuntando al Usuario.
   */
  crearPacienteAdmin = async (req, res, next) => {
    try {
      const { dni, nombre } = req.body;
      const resultado = await this.adminService.crearPacienteAdmin({ dni, nombre });
      return res.status(201).json({ status: 'created', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /admins/medico
   * El admin da de alta un médico: crea el Usuario con DNI + nombre (inactivo)
   * y el perfil Medico con matrícula.
   */
  crearMedicoAdmin = async (req, res, next) => {
    try {
      const { dni, nombre, matricula } = req.body;
      const resultado = await this.adminService.crearMedicoAdmin({ dni, nombre, matricula });
      return res.status(201).json({ status: 'created', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  /**
   * POST /admins/usuario
   * El admin da de alta un usuario con uno o más roles (Paciente y/o Médico).
   */
  crearUsuarioAdmin = async (req, res, next) => {
    try {
      const { dni, nombre, matricula, roles } = req.body;
      const resultado = await this.adminService.crearUsuarioAdmin({ dni, nombre, matricula, roles });
      return res.status(201).json({ status: 'created', data: resultado });
    } catch (error) {
      return next(error);
    }
  };
}

export const adminController = new AdminController();

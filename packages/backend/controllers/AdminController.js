import { adminService } from '../services/AdminService.js';
import { turnoService } from '../services/TurnoService.js';
import { logger } from '../utils/logger.js';
export class AdminController {
  constructor({ adminService: svc = adminService, turnoService: turnoSvc = turnoService
  } 
  = {}) {
    this.adminService = svc;
    this.turnoService = turnoSvc;
  }

  /**
   * POST /admins/paciente
   * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
   * El perfil Paciente se crea vacío apuntando al Usuario.
   */
  crearPacienteAdmin = async (req, res, next) => {
    try {
      const { dni, nombre, obraSocial, plan } = req.body;
      const resultado = await this.adminService.crearPacienteAdmin({
        dni,
        nombre,
        obraSocial,
        plan,
      });
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
      const { dni, nombre, matricula, obraSocial, plan, roles } = req.body;
      const resultado = await this.adminService.crearUsuarioAdmin({
        dni,
        nombre,
        matricula,
        obraSocial,
        plan,
        roles,
      });
      return res.status(201).json({ status: 'created', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  correrProcesoBatch = async (req, res, next) => {
    try {
      logger.info('Proceso batch iniciado manualmente');

      await this.turnoService.refrescarSlots();

      return res.status(201).json({
        status: 'success',
        message: 'Proceso batch realizado exitosamente',
      });
    } catch (error) {
      logger.error('Error al correr el proceso batch:', error.message);
      return next(error);
    }
  };
}

export const adminController = new AdminController();

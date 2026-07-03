import bcrypt from 'bcryptjs';
import {
  ConflictError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} from '../errors/AppError.js';
import { usuarioService } from './UsuarioService.js';
import { medicoService } from './MedicoService.js';
import { pacienteService } from './PacienteService.js';
import { Rol } from '../domain/usuario/Rol.js';

export class AdminService {
  constructor({
    usuarioService: usuarioSvc = usuarioService,
    medicoService: medicoSvc = medicoService,
    pacienteService: pacienteSvc = pacienteService,
  } = {}) {
    this.usuarioService = usuarioSvc;
    this.medicoService = medicoSvc;
    this.pacienteService = pacienteSvc;
  }

  /**
   * POST /admin/crear-paciente
   * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
   * El perfil Paciente se crea vacío apuntando al Usuario.
   */
  async crearPacienteAdmin({ dni, nombre }) {
    if (!dni || !nombre) {
      throw new BadRequestError('dni y nombre son obligatorios');
    }

    const existente = await this.usuarioService.findByDniAndRole(dni, Rol.PACIENTE);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario paciente con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      roles: ['PACIENTE'],
      activo: false,
    });

    const paciente = await this.pacienteService.crearPaciente({ usuario, nombre });

    return { usuario, paciente };
  }

  /**
   * POST /admin/crear-medico
   * El admin da de alta un médico: crea el Usuario con DNI + nombre (inactivo)
   * y el perfil Medico con matrícula.
   */
  async crearMedicoAdmin({ dni, nombre, matricula }) {
    if (!dni || !nombre || !matricula) {
      throw new BadRequestError('dni, nombre y matricula son obligatorios');
    }

    const existente = await this.usuarioService.findByDniAndRole(dni, Rol.MEDICO);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario médico con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      roles: ['MEDICO'],
      activo: false,
    });

    const medico = await this.medicoService.crearMedico({ usuario, matricula, nombre });

    return { usuario, medico };
  }
}

export const adminService = new AdminService();

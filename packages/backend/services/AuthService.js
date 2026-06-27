import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/AppError.js';
import { usuarioService } from './UsuarioService.js';
import { medicoService } from './MedicoService.js';
import { pacienteService } from './PacienteService.js';

export class AuthService {
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
   * POST /auth/admin/crear-paciente
   * El admin da de alta un paciente: crea el Usuario con DNI + nombre (inactivo).
   * El perfil Paciente se crea vacío apuntando al Usuario.
   */
  async crearPacienteAdmin({ dni, nombre }) {
    if (!dni || !nombre) {
      throw new BadRequestError('dni y nombre son obligatorios');
    }

    const existente = await this.usuarioService.findByDni(dni);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      nombre,
      roles: ['PACIENTE'],
      activo: false,
    });

    const paciente = await this.pacienteService.crearPaciente({ usuario });

    return { usuario, paciente };
  }

  /**
   * POST /auth/admin/crear-medico
   * El admin da de alta un médico: crea el Usuario con DNI + nombre (inactivo)
   * y el perfil Medico con matrícula.
   */
  async crearMedicoAdmin({ dni, nombre, matricula }) {
    if (!dni || !nombre || !matricula) {
      throw new BadRequestError('dni, nombre y matricula son obligatorios');
    }

    const existente = await this.usuarioService.findByDni(dni);
    if (existente) {
      throw new ConflictError(`Ya existe un usuario con DNI ${dni}`);
    }

    const usuario = await this.usuarioService.save({
      dni,
      nombre,
      roles: ['MEDICO'],
      activo: false,
    });

    const medico = await this.medicoService.crearMedico({ usuario, matricula, nombre });

    return { usuario, medico };
  }

  /**
   * POST /auth/register
   * El usuario se registra con su DNI, email y contraseña.
   * Busca el Usuario por DNI, verifica que esté inactivo, y lo activa.
   */
  async register({ dni, email, password }) {
    if (!dni || !email || !password) {
      throw new BadRequestError('dni, email y password son obligatorios');
    }

    const usuarioConEmail = await this.usuarioService.findByEmail(email);
    if (usuarioConEmail) {
      throw new ConflictError('Ya existe una cuenta asociada a ese email');
    }

    const usuario = await this.usuarioService.findByDni(dni);
    if (!usuario) {
      throw new NotFoundError('No existe ningún usuario con ese DNI. Contacte al administrador.');
    }

    if (usuario.activo) {
      throw new ConflictError('Este usuario ya fue activado previamente');
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const passwordHasheada = await bcrypt.hash(password, saltRounds);

    const usuarioActivado = await this.usuarioService.save({
      _id: usuario.id,
      email,
      password: passwordHasheada,
      activo: true,
    });

    return { usuario: usuarioActivado };
  }
}

export const authService = new AuthService();
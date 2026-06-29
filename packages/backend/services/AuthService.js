import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError, BadRequestError, UnauthorizedError } from '../errors/AppError.js';
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
      roles: ['PACIENTE'],
      activo: false,
    });

    const paciente = await this.pacienteService.crearPaciente({ usuario, nombre });

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
  async register({ dni, email, password, nombreUsuario, numTel, direccion, fechaNacimiento }) {
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

    // Parsear fecha DD/MM/YYYY -> Date
    let fechaNacimientoDate;
    if (fechaNacimiento) {
      const [dia, mes, anio] = fechaNacimiento.split('/');
      fechaNacimientoDate = new Date(`${anio}-${mes}-${dia}`);
      if (isNaN(fechaNacimientoDate.getTime())) {
        throw new BadRequestError('Fecha de nacimiento inválida. Usá el formato DD/MM/YYYY.');
      }
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const passwordHasheada = await bcrypt.hash(password, saltRounds);

    const usuarioActivado = await this.usuarioService.save({
      _id: usuario.id,
      email,
      password: passwordHasheada,
      activo: true,
      ...(nombreUsuario && { nombreUsuario }),
      ...(numTel && { numTel }),
      ...(direccion && { direccion }),
      ...(fechaNacimientoDate && { fechaNacimiento: fechaNacimientoDate }),
    });

    return { usuario: usuarioActivado };
  }

  async login({ email, password }) {
    const usuario = await this.usuarioService.findByEmail(email);

    if (!usuario) {
      throw new UnauthorizedError('El email y/o contraseña son incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      throw new UnauthorizedError('El email y/o contraseña son incorrectos');
    }

    return;
  }

}

export const authService = new AuthService();
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
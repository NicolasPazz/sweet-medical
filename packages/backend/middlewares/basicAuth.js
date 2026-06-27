import bcrypt from 'bcryptjs';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';

/**
 * Middleware de autenticación HTTP Basic.
 *
 * Espera el header: Authorization: Basic <base64(username:password)>
 * Verifica que el usuario exista, que la contraseña sea correcta,
 * y que tenga el rol ADMIN.
 *
 * Si todo es correcto, adjunta el usuario en req.usuarioAutenticado.
 */
export async function basicAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedError('Se requiere autenticación Basic');
    }

    // Decodificar base64
    const base64 = authHeader.slice('Basic '.length);
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) {
      throw new UnauthorizedError('Formato de credenciales inválido');
    }

    const nombreUsuario = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (!nombreUsuario || !password) {
      throw new UnauthorizedError('Usuario y contraseña son obligatorios');
    }

    // Buscar el usuario en la BD
    const usuario = await usuarioRepository.findByNombreUsuario(nombreUsuario);
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar la contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar que tenga rol ADMIN
    if (!usuario.roles?.includes('ADMIN')) {
      throw new ForbiddenError('No tenés permisos para realizar esta acción');
    }

    // Adjuntar el usuario autenticado al request para uso posterior
    req.usuarioAutenticado = usuario;

    next();
  } catch (error) {
    next(error);
  }
}

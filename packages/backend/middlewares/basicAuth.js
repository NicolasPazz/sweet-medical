import bcrypt from 'bcryptjs';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';

async function resolverUsuario(req) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    throw new UnauthorizedError('Se requiere autenticación Basic');
  }

  const base64 = authHeader.slice('Basic '.length);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const separatorIndex = decoded.indexOf(':');

  if (separatorIndex === -1) {
    throw new UnauthorizedError('Formato de credenciales inválido');
  }

  const identificador = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (!identificador || !password) {
    throw new UnauthorizedError('Usuario y contraseña son obligatorios');
  }

  let usuario = await usuarioRepository.findByNombreUsuario(identificador);
  if (!usuario) {
    usuario = await usuarioRepository.findByEmail(identificador);
  }
  if (!usuario) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  return usuario;
}

/**
 * Verifica credenciales Basic y que el usuario tenga rol ADMIN.
 */
export async function basicAuthAdmin(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);

    if (!usuario.roles?.includes('ADMIN')) {
      throw new ForbiddenError('No tenés permisos para realizar esta acción');
    }

    req.usuarioAutenticado = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Verifica credenciales Basic sin chequear rol (cualquier usuario activo).
 */
export async function basicAuthUser(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);
    console.log('Usuario autenticado en basic auth: ', usuario);
    req.usuarioAutenticado = usuario;
    console.log('Usuario2 autenticado en basic auth: ', usuario);
    next();
  } catch (error) {
    next(error);
  }
}

export async function basicAuthPaciente(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);
    if (!usuario.roles?.includes('PACIENTE')) {
      throw new ForbiddenError('No tenés permisos para realizar esta acción');
    }
    req.usuarioAutenticado = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

export async function basicAuthMedico(req, res, next) {
  try {
    const usuario = await resolverUsuario(req);
    if (!usuario.roles?.includes('MEDICO')) {
      throw new ForbiddenError('No tenés permisos para realizar esta acción');
    }
    req.usuarioAutenticado = usuario;
    next();
  } catch (error) {
    next(error);
  }
}

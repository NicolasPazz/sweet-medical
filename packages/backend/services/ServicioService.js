import { Especialidad } from '../domain/servicios/Especialidad.js';
import { Practica } from '../domain/servicios/Practica.js';
import { servicioRepository } from '../infrastructure/repositories/ServicioRepository.js';
import { usuarioRepository } from '../infrastructure/repositories/UsuarioRepository.js';
import { Usuario } from '../domain/usuario/Usuario.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { logger } from '../utils/logger.js';

export class ServicioService {
  constructor({
    servicioRepository: servicioRepo = servicioRepository,
    usuarioRepository: usuarioRepo = usuarioRepository,
  } = {}) {
    this.servicioRepository = servicioRepo;
    this.usuarioRepository = usuarioRepo;
  }

  async verificarUsuarioSistema(idUsuario) {
    ValidadorId.validarIds(idUsuario);
    const usuario = await this.usuarioRepository.findById(idUsuario);
    if (!usuario) {
      throw new NotFoundError('Usuario no encontrado');
    }
    if (usuario.nombreUsuario !== 'SISTEMA') {
      throw new ForbiddenError('Solo el usuario SISTEMA puede realizar esta operación');
    }
  }

  async obtenerTodos() {
    return await this.servicioRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const servicio = await this.servicioRepository.findById(id);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    return servicio;
  }

  async agregar(idUsuario, datosServicio) {
    await this.verificarUsuarioSistema(idUsuario);

    let servicio;

    if (datosServicio.codigo) {
      servicio = new Practica(
        datosServicio.codigo,
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo,
      );
    } else {
      servicio = new Especialidad(
        datosServicio.nombre,
        datosServicio.duracionTurnoEnMins,
        datosServicio.costo,
      );
    }

    return await this.servicioRepository.save(servicio);
  }

  async modificar(idUsuario, id, datosActualizados, tipoServicio) {
    await this.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = await this.servicioRepository.findByIdAndTipoServicio(id, tipoServicio);

    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    logger.debug(servicio);
    if (servicio.codigo === undefined && datosActualizados.codigo !== undefined) {
      throw new BadRequestError('No se puede modificar ni asignar un código a una Especialidad.');
    }
    if (tipoServicio == 'ESPECIALIDAD')
      return await this.servicioRepository.updateEspecialidad(id, datosActualizados);
    else if (tipoServicio == 'PRACTICA')
      return await this.servicioRepository.updatePractica(id, datosActualizados);

    throw new NotFoundError('Servicio no encontrado');
  }

  async eliminar(idUsuario, id, tipoServicio) {
    await this.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = await this.servicioRepository.findByIdAndTipoServicio(id, tipoServicio);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    const data = { activo: false };
    if (tipoServicio == 'ESPECIALIDAD')
      return await this.servicioRepository.updateEspecialidad(id, data);
    else if (tipoServicio == 'PRACTICA')
      return await this.servicioRepository.updatePractica(id, data);
  }
}

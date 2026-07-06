import { servicioRepository } from '../infrastructure/repositories/ServicioRepository.js';
import { usuarioService } from './UsuarioService.js';
import { Especialidad } from '../domain/servicios/Especialidad.js';
import { Practica } from '../domain/servicios/Practica.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { logger } from '../utils/logger.js';

export class ServicioService {
  constructor({
    servicioRepository: servicioRepo = servicioRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.servicioRepository = servicioRepo;
    this.usuarioService = usuarioSvc;
  }

  async findById(id) {
    return await this.servicioRepository.findById(id);
  }

  async findByIdAndTipoServicio(id, tipoServicio) {
    return await this.servicioRepository.findByIdAndTipoServicio(id, tipoServicio);
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
    await this.usuarioService.verificarUsuarioSistema(idUsuario);

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
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = await this.servicioRepository.findByIdAndTipoServicio(id, tipoServicio);

    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    logger.debug(servicio);
    if (servicio.codigo === undefined && datosActualizados.codigo !== undefined) {
      throw new BadRequestError('No se puede modificar ni asignar un cÃ³digo a una Especialidad.');
    }

    const actualTipo =
      tipoServicio || (servicio.codigo !== undefined ? 'PRACTICA' : 'ESPECIALIDAD');
    if (actualTipo == 'ESPECIALIDAD')
      return await this.servicioRepository.updateEspecialidad(id, datosActualizados);
    else if (actualTipo == 'PRACTICA')
      return await this.servicioRepository.updatePractica(id, datosActualizados);

    throw new NotFoundError('Servicio no encontrado');
  }

  async eliminar(idUsuario, id, tipoServicio) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);

    const servicio = await this.servicioRepository.findByIdAndTipoServicio(id, tipoServicio);
    if (!servicio) {
      throw new NotFoundError('Servicio no encontrado');
    }
    const actualTipo =
      tipoServicio || (servicio.codigo !== undefined ? 'PRACTICA' : 'ESPECIALIDAD');
    const data = { activo: false };
    if (actualTipo == 'ESPECIALIDAD')
      return await this.servicioRepository.updateEspecialidad(id, data);
    else if (actualTipo == 'PRACTICA')
      return await this.servicioRepository.updatePractica(id, data);
  }
}

export const servicioService = new ServicioService();

import { Sede } from '../domain/servicios/Sede.js';
import { sedeRepository } from '../infrastructure/repositories/SedeRepository.js';
import { usuarioService } from './UsuarioService.js';
import { NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class SedeService {
  constructor({
    sedeRepository: sedeRepo = sedeRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.sedeRepository = sedeRepo;
    this.usuarioService = usuarioSvc;
  }

  async obtenerTodos() {
    return await this.sedeRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new NotFoundError('Sede no encontrada');
    return sede;
  }

  async agregar(idUsuario, datosSede) {
    await this.usuarioService.verificarUsuarioAdmin(idUsuario);
    const sede = new Sede(datosSede.nombre, datosSede.direccion);
    return await this.sedeRepository.save(sede);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this.usuarioService.verificarUsuarioAdmin(idUsuario);
    ValidadorId.validarIds(id);
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new NotFoundError('Sede no encontrada');
    return await this.sedeRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this.usuarioService.verificarUsuarioAdmin(idUsuario);
    ValidadorId.validarIds(id);
    const sede = await this.sedeRepository.findById(id);
    if (!sede) throw new NotFoundError('Sede no encontrada');
    return await this.sedeRepository.delete(id);
  }
}

export const sedeService = new SedeService();

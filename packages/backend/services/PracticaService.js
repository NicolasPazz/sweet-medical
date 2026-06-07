import { Practica } from '../domain/servicios/Practica.js';
import { practicaRepository } from '../infrastructure/repositories/PracticaRepository.js';
import { usuarioService } from './UsuarioService.js';
import { NotFoundError } from '../errors/AppError.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class PracticaService {
  constructor({
    practicaRepository: practicaRepo = practicaRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.practicaRepository = practicaRepo;
    this.usuarioService = usuarioSvc;
  }

  async obtenerTodos() {
    return await this.practicaRepository.findAll();
  }

  async obtenerPorId(id) {
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return practica;
  }

  async agregar(idUsuario, datosPractica) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    const practica = new Practica(
      datosPractica.codigo,
      datosPractica.nombre,
      datosPractica.duracionTurnoEnMins,
      datosPractica.costo,
    );
    return await this.practicaRepository.save(practica);
  }

  async modificar(idUsuario, id, datosActualizados) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, datosActualizados);
  }

  async eliminar(idUsuario, id) {
    await this.usuarioService.verificarUsuarioSistema(idUsuario);
    ValidadorId.validarIds(id);
    const practica = await this.practicaRepository.findById(id);
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return await this.practicaRepository.update(id, { activo: false });
  }
}

export const practicaService = new PracticaService();

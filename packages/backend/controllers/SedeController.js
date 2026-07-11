import { sedeService } from '../services/SedeService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class SedeController {
  constructor({ sedeService: svc = sedeService } = {}) {
    this.sedeService = svc;
  }

  obtenerTodos = async (req, res, next) => {
    try {
      const resultado = await this.sedeService.obtenerTodos();
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      ValidadorId.validarIds(id);
      const resultado = await this.sedeService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const { idUsuario } = req.body;
      ValidadorId.validarIds(idUsuario);
      const datosSede = this._validarCuerpoCreacion(req.body);
      const sedeAgregada = await this.sedeService.agregar(idUsuario, datosSede);
      return res.status(201).json({ status: 'created', data: sedeAgregada });
    } catch (error) {
      return next(error);
    }
  };

  modificar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { idUsuario } = req.body;
      ValidadorId.validarIds(id, idUsuario);
      const datosActualizados = this._validarCuerpoModificacion(req.body);
      const sedeModificada = await this.sedeService.modificar(idUsuario, id, datosActualizados);
      return res.status(200).json({ status: 'success', data: sedeModificada });
    } catch (error) {
      return next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { idUsuario } = req.body;
      ValidadorId.validarIds(id, idUsuario);
      await this.sedeService.eliminar(idUsuario, id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  _validarCuerpoCreacion(body) {
    if (typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
      throw new BadRequestError('El nombre no puede estar vacío');
    }
    if (typeof body.direccion !== 'string' || body.direccion.trim().length === 0) {
      throw new BadRequestError('La dirección no puede estar vacía');
    }
    return { nombre: body.nombre.trim(), direccion: body.direccion.trim() };
  }

  _validarCuerpoModificacion(body) {
    const datos = {};
    if (body.nombre !== undefined) {
      if (typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
        throw new BadRequestError('El nombre no puede estar vacío');
      }
      datos.nombre = body.nombre.trim();
    }
    if (body.direccion !== undefined) {
      if (typeof body.direccion !== 'string' || body.direccion.trim().length === 0) {
        throw new BadRequestError('La dirección no puede estar vacía');
      }
      datos.direccion = body.direccion.trim();
    }
    return datos;
  }
}

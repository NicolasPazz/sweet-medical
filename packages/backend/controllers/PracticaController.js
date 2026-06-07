import { practicaService } from '../services/PracticaService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class PracticaController {
  constructor({ practicaService: svc = practicaService } = {}) {
    this.practicaService = svc;
  }

  obtenerTodos = async (req, res, next) => {
    try {
      const resultado = await this.practicaService.obtenerTodos();
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      ValidadorId.validarIds(id);
      const resultado = await this.practicaService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const { idUsuario } = req.body;
      ValidadorId.validarIds(idUsuario);
      const datosPractica = this._validarCuerpoCreacion(req.body);
      const practicaAgregada = await this.practicaService.agregar(idUsuario, datosPractica);
      return res.status(201).json({ status: 'created', data: practicaAgregada });
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
      const practicaModificada = await this.practicaService.modificar(
        idUsuario,
        id,
        datosActualizados,
      );
      return res.status(200).json({ status: 'success', data: practicaModificada });
    } catch (error) {
      return next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { idUsuario } = req.body;
      ValidadorId.validarIds(id, idUsuario);
      await this.practicaService.eliminar(idUsuario, id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  _validarCuerpoCreacion(body) {
    if (typeof body.codigo !== 'string' || body.codigo.trim().length === 0) {
      throw new BadRequestError('El código no puede estar vacío');
    }
    if (typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
      throw new BadRequestError('El nombre no puede estar vacío');
    }
    const duracionTurnoEnMins = Number(body.duracionTurnoEnMins);
    if (!Number.isInteger(duracionTurnoEnMins) || duracionTurnoEnMins <= 0) {
      throw new BadRequestError('La duración del turno debe ser un entero positivo');
    }
    const costo = Number(body.costo);
    if (!Number.isFinite(costo) || costo < 0) {
      throw new BadRequestError('El costo debe ser un número no negativo');
    }
    return { codigo: body.codigo.trim(), nombre: body.nombre.trim(), duracionTurnoEnMins, costo };
  }

  _validarCuerpoModificacion(body) {
    const datos = {};
    if (body.codigo !== undefined) {
      if (typeof body.codigo !== 'string' || body.codigo.trim().length === 0) {
        throw new BadRequestError('El código no puede estar vacío');
      }
      datos.codigo = body.codigo.trim();
    }
    if (body.nombre !== undefined) {
      if (typeof body.nombre !== 'string' || body.nombre.trim().length === 0) {
        throw new BadRequestError('El nombre no puede estar vacío');
      }
      datos.nombre = body.nombre.trim();
    }
    if (body.duracionTurnoEnMins !== undefined) {
      const duracionTurnoEnMins = Number(body.duracionTurnoEnMins);
      if (!Number.isInteger(duracionTurnoEnMins) || duracionTurnoEnMins <= 0) {
        throw new BadRequestError('La duración del turno debe ser un entero positivo');
      }
      datos.duracionTurnoEnMins = duracionTurnoEnMins;
    }
    if (body.costo !== undefined) {
      const costo = Number(body.costo);
      if (!Number.isFinite(costo) || costo < 0) {
        throw new BadRequestError('El costo debe ser un número no negativo');
      }
      datos.costo = costo;
    }
    return datos;
  }
}

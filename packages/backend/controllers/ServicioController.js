import { ServicioService } from '../services/ServicioService.js';
import { ValidadorId } from '../domain/utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

const TIPOS_SERVICIO_VALIDOS = ['ESPECIALIDAD', 'PRACTICA'];

// Al guardar servicios en Mongo, vamos a usar campo discriminante tipo (ESPECIALIDAD o PRACTICA)
export class ServicioController {
  constructor({ servicioService = new ServicioService() } = {}) {
    this.servicioService = servicioService;
  }

  obtenerTodos = async (req, res, next) => {
    try {
      const resultado = await this.servicioService.obtenerTodos();
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const id = this.parsearId(req.params.id);
      const resultado = await this.servicioService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const idUsuario = this.parsearId(req.body.idUsuario);
      const datosServicio = this.extraerYValidarBodyServicio(req.body);
      const servicioAgregado = await this.servicioService.agregar(idUsuario, datosServicio);
      return res.status(201).json({ status: 'created', data: servicioAgregado });
    } catch (error) {
      return next(error);
    }
  };

  modificar = async (req, res, next) => {
    try {
      const id = this.parsearId(req.params.id);
      const idUsuario = this.parsearId(req.body.idUsuario);
      const datosActualizados = this.extraerYValidarBodyServicio(req.body);
      const servicioModificado = await this.servicioService.modificar(
        idUsuario,
        id,
        datosActualizados,
      );
      return res.status(200).json({ status: 'success', data: servicioModificado });
    } catch (error) {
      return next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const id = this.parsearId(req.params.id);
      const idUsuario = this.parsearId(req.body.idUsuario);
      await this.servicioService.eliminar(idUsuario, id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  extraerYValidarBodyServicio(body) {
    if (!body.tipo || !TIPOS_SERVICIO_VALIDOS.includes(body.tipo)) {
      throw new BadRequestError(
        `El tipo de servicio es inválido. Los valores aceptados son: ${TIPOS_SERVICIO_VALIDOS.join(', ')}`,
      );
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

    const datos = {
      tipo: body.tipo,
      nombre: body.nombre.trim(),
      duracionTurnoEnMins,
      costo,
    };

    if (body.tipo === 'PRACTICA') {
      if (typeof body.codigo !== 'string' || body.codigo.trim().length === 0) {
        throw new BadRequestError('El código es requerido para una Práctica');
      }
      datos.codigo = body.codigo.trim();
    }

    return datos;
  }

  parsearId(valor) {
    const id = Number(valor);
    ValidadorId.validarIds(id);
    return id;
  }
}

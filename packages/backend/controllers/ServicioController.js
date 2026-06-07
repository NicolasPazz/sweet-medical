import { servicioService } from '../services/ServicioService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class ServicioController {
  constructor({ servicioService: svc = servicioService } = {}) {
    this.servicioService = svc;
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
      const id = req.params.id;
      ValidadorId.validarIds(id);
      const resultado = await this.servicioService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const idUsuario = req.body.idUsuario;
      ValidadorId.validarIds(idUsuario);

      const datosServicio = this.validarCuerpoCreacion(req.body);

      const servicioAgregado = await this.servicioService.agregar(idUsuario, datosServicio);
      return res.status(201).json({ status: 'created', data: servicioAgregado });
    } catch (error) {
      return next(error);
    }
  };

  modificar = async (req, res, next) => {
    try {
      const id = req.params.id;
      const idUsuario = req.body.idUsuario;
      ValidadorId.validarIds(id, idUsuario);

      const datosActualizados = this.validarCuerpoModificacion(req.body);
      const tipoServicio = req.body.tipoServicio || req.body.tipo;
      const servicioModificado = await this.servicioService.modificar(
        idUsuario,
        id,
        datosActualizados,
        tipoServicio,
      );
      return res.status(200).json({ status: 'success', data: servicioModificado });
    } catch (error) {
      return next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const id = req.params.id;
      const idUsuario = req.body.idUsuario;
      const tipoServicio = req.body.tipoServicio || req.body.tipo;
      this.validarTipoServicio(req.body);
      ValidadorId.validarIds(id, idUsuario);
      await this.servicioService.eliminar(idUsuario, id, tipoServicio);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  validarCuerpoCreacion(body) {
    if (body.tipo !== 'ESPECIALIDAD' && body.tipo !== 'PRACTICA') {
      throw new BadRequestError('El tipo de servicio debe ser ESPECIALIDAD o PRACTICA');
    }

    if (
      body.tipo === 'PRACTICA' &&
      (body.codigo === undefined ||
        typeof body.codigo !== 'string' ||
        body.codigo.trim().length === 0)
    ) {
      throw new BadRequestError('El código es obligatorio para una Práctica');
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
      nombre: body.nombre.trim(),
      duracionTurnoEnMins,
      costo,
    };

    if (body.codigo !== undefined) {
      if (typeof body.codigo !== 'string' || body.codigo.trim().length === 0) {
        throw new BadRequestError('El código no puede estar vacío');
      }
      datos.codigo = body.codigo.trim();
    }

    return datos;
  }

  validarCuerpoModificacion(body) {
    const datos = {};

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

    if (body.codigo !== undefined) {
      if (typeof body.codigo !== 'string' || body.codigo.trim().length === 0) {
        throw new BadRequestError('El código no puede estar vacío');
      }
      datos.codigo = body.codigo.trim();
    }

    this.validarTipoServicio(body);

    return datos;
  }

  validarTipoServicio(body) {
    if (!body) return;
    const tipo = body.tipoServicio || body.tipo;
    if (tipo !== undefined) {
      if (typeof tipo !== 'string' || tipo.trim().length === 0) {
        throw new BadRequestError('El tipo de servicio no puede estar vacío');
      }
      if (tipo !== 'ESPECIALIDAD' && tipo !== 'PRACTICA') {
        throw new BadRequestError('El tipo de servicio debe ser ESPECIALIDAD o PRACTICA');
      }
    }
  }
}

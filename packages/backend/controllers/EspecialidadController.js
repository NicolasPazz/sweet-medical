import { especialidadService } from '../services/EspecialidadService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { BadRequestError } from '../errors/AppError.js';

export class EspecialidadController {
  constructor({ especialidadService: svc = especialidadService } = {}) {
    this.especialidadService = svc;
  }

  obtenerTodos = async (req, res, next) => {
    try {
      const resultado = await this.especialidadService.obtenerTodos();
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      ValidadorId.validarIds(id);
      const resultado = await this.especialidadService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregar = async (req, res, next) => {
    try {
      const { idUsuario } = req.body;
      ValidadorId.validarIds(idUsuario);
      const datosEspecialidad = this._validarCuerpoCreacion(req.body);
      const especialidadAgregada = await this.especialidadService.agregar(
        idUsuario,
        datosEspecialidad,
      );
      return res.status(201).json({ status: 'created', data: especialidadAgregada });
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
      const especialidadModificada = await this.especialidadService.modificar(
        idUsuario,
        id,
        datosActualizados,
      );
      return res.status(200).json({ status: 'success', data: especialidadModificada });
    } catch (error) {
      return next(error);
    }
  };

  eliminar = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { idUsuario } = req.body;
      ValidadorId.validarIds(id, idUsuario);
      await this.especialidadService.eliminar(idUsuario, id);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  };

  eliminarDeMedico = async (req, res, next) => {
    try {
      const { id_usuario } = req.params;
      const { id: especialidadId } = req.body;
      ValidadorId.validarIds(id_usuario, especialidadId);
      const resultado = await this.especialidadService.eliminarDeMedico(id_usuario, especialidadId);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  agregarAMedico = async (req, res, next) => {
    try {
      const { id_usuario } = req.params;
      const { id: especialidadId } = req.body;
      ValidadorId.validarIds(id_usuario, especialidadId);
      const resultado = await this.especialidadService.agregarAMedico(id_usuario, especialidadId);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerTodosPorMedicoMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const especialidades = await this.especialidadService.obtenerTodosPorMedico(usuario.id);
      return res.status(200).json({ status: 'success', data: especialidades });
    } catch (error) {
      return next(error);
    }
  };

  agregarAMedicoMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const { id: especialidadId } = req.body;
      ValidadorId.validarIds(especialidadId);
      const resultado = await this.especialidadService.agregarAMedico(usuario.id, especialidadId);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  eliminarDeMedicoMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const { id: especialidadId } = req.body;
      ValidadorId.validarIds(especialidadId);
      const resultado = await this.especialidadService.eliminarDeMedico(usuario.id, especialidadId);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerTodosPorMedico = async (req, res, next) => {
    try {
      const { id_usuario } = req.params;

      ValidadorId.validarIds(id_usuario);

      const especialidades = await this.especialidadService.obtenerTodosPorMedico(id_usuario);

      return res.status(200).json({ status: 'success', data: especialidades });
    } catch (error) {
      return next(error);
    }
  };

  _validarCuerpoCreacion(body) {
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
    return { nombre: body.nombre.trim(), duracionTurnoEnMins, costo };
  }

  _validarCuerpoModificacion(body) {
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
    return datos;
  }
}

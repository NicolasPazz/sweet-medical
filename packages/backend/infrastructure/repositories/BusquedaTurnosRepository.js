import { TurnoModel } from '../models/TurnoModel.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import { logger } from '../../domain/utils/logger.js';
import mongoose from 'mongoose';

export class BusquedaTurnosRepository {
  async buscar(specification, sortParams, paginationParams) {
    try {
      const criteria = specification.toCriteria();

      const query = {
        estado: EstadoTurno.DISPONIBLE,
      };

      if (criteria.profesionalId) {
        query.medico = new mongoose.Types.ObjectId(criteria.profesionalId);
      }

      if (criteria.especialidad) {
        query['especialidad.nombre'] = {
          $regex: criteria.especialidad,
          $options: 'i',
        };
      }

      if (criteria.practica) {
        query['practica.nombre'] = {
          $regex: criteria.practica,
          $options: 'i',
        };
      }

      if (criteria.sede) {
        query['sede.nombre'] = {
          $regex: criteria.sede,
          $options: 'i',
        };
      }

      if (criteria.fechaDesde || criteria.fechaHasta) {
        query.fechaHora = {};

        if (criteria.fechaDesde) {
          query.fechaHora.$gte = new Date(criteria.fechaDesde);
        }

        if (criteria.fechaHasta) {
          query.fechaHora.$lte = new Date(criteria.fechaHasta);
        }
      } else {
        query.fechaHora = { $gte: new Date() };
      }

      logger.debug('Query construida:', query);

      let mongoQuery = TurnoModel.find(query);

      // ORDENAMIENTO
      if (sortParams) {
        const { sortBy, sortOrder } = sortParams;

        const campo = sortBy === 'fecha' ? 'fechaHora' : sortBy;

        mongoQuery = mongoQuery.sort({
          [campo]: sortOrder === 'desc' ? -1 : 1,
        });
      }

      // PAGINACIÓN
      if (paginationParams) {
        const { page, limit } = paginationParams;

        const skip = (page - 1) * limit;

        mongoQuery = mongoQuery.skip(skip).limit(limit);
      }

      // EJECUCIÓN FINAL
      const data = await mongoQuery.populate('medico').exec();

      // CONTEO TOTAL
      const total = await TurnoModel.countDocuments(query);

      return {
        data,
        total,
      };
    } catch (error) {
      logger.error('Error en BusquedaTurnosRepository.buscar:', error);
      throw new Error('Error al consultar los turnos en la base de datos');
    }
  }
}

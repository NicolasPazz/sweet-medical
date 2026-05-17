import { TurnoModel } from '../schemas/TurnoSchema.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import { turnoRepository } from './TurnoRepository.js';
import { logger } from '../../utils/logger.js';
import mongoose from 'mongoose';

export class BusquedaTurnosRepository {
  // LEER
  async search(specification, sortParams, paginationParams) {
    const criteria = specification.toCriteria();

    const query = {
      estado: EstadoTurno.DISPONIBLE,
    };

    if (criteria.profesionalId) {
      query.medico = new mongoose.Types.ObjectId(criteria.profesionalId);
    }

    const servicioBusqueda = criteria.servicio || criteria.especialidad || criteria.practica;
    if (servicioBusqueda) {
      query['servicio.nombre'] = { $regex: servicioBusqueda, $options: 'i' };
    }

    if (criteria.sede) {
      query['sede.nombre'] = { $regex: criteria.sede, $options: 'i' };
    }

    if (criteria.fechaDesde || criteria.fechaHasta) {
      query.fechaHora = {};
      if (criteria.fechaDesde) query.fechaHora.$gte = new Date(criteria.fechaDesde);
      if (criteria.fechaHasta) query.fechaHora.$lte = new Date(criteria.fechaHasta);
    } else {
      query.fechaHora = { $gte: new Date() };
    }

    logger.debug('Query construida:', query);

    let mongoQuery = TurnoModel.find(query).populate('medico');

    if (sortParams) {
      const { sortBy, sortOrder } = sortParams;
      const field = sortBy === 'fecha' ? 'fechaHora' : sortBy;
      mongoQuery = mongoQuery.sort({ [field]: sortOrder === 'desc' ? -1 : 1 });
    }

    if (paginationParams) {
      const { page, limit } = paginationParams;
      mongoQuery = mongoQuery.skip((page - 1) * limit).limit(limit);
    }

    const docs = await mongoQuery.lean().exec();
    const total = await TurnoModel.countDocuments(query);

    return {
      data: turnoRepository._hidratarColeccion(docs),
      total,
    };
  }

  async buscar(specification, sortParams, paginationParams) {
    return this.search(specification, sortParams, paginationParams);
  }
}

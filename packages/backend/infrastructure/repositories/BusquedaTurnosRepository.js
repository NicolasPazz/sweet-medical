import { TurnoModel } from '../schemas/TurnoSchema.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import mongoose from 'mongoose';

export class BusquedaTurnosRepository {
  async buscar(specification, sortParams, paginationParams) {
    const criteria = specification.toCriteria();

    const query = { estado: EstadoTurno.DISPONIBLE };

    if (criteria.profesionalId) query.medico = new mongoose.Types.ObjectId(criteria.profesionalId);
    if (criteria.sede) query['sede.nombre'] = { $regex: criteria.sede, $options: 'i' };

    const servicio = criteria.servicio || criteria.especialidad || criteria.practica;
    if (servicio) query['servicio.nombre'] = { $regex: servicio, $options: 'i' };

    if (criteria.fechaDesde || criteria.fechaHasta) {
      query.fechaHora = {};
      if (criteria.fechaDesde) query.fechaHora.$gte = new Date(criteria.fechaDesde);
      if (criteria.fechaHasta) query.fechaHora.$lte = new Date(criteria.fechaHasta);
    } else {
      query.fechaHora = { $gte: new Date() };
    }

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

    const [data, total] = await Promise.all([mongoQuery.exec(), TurnoModel.countDocuments(query)]);

    return { data, total };
  }
}

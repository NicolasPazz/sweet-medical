import { TurnoModel } from '../models/TurnoModel.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import { logger } from '../../domain/utils/logger.js';
import mongoose from 'mongoose';

export class BusquedaTurnosRepository {

  async buscar(specification, sortParams, paginationParams) {
    try {
      // specification.toCriteria() extrae los filtros (ej: { profesionalId: '123' }) 
      // de un objeto de lógica de negocio.
      const criteria = specification.toCriteria();

      // 1. BASE DE LA CONSULTA
      // Solo queremos turnos que estén en estado "DISPONIBLE".
      const query = {
        estado: EstadoTurno.DISPONIBLE
      };

      // 2. FILTROS DINÁMICOS
      // Si el usuario envió un ID de médico, lo agregamos al filtro.
      // mongoose.Types.ObjectId convierte el string en un formato que MongoDB entiende.
      if (criteria.profesionalId) {
        query.medico = new mongoose.Types.ObjectId(criteria.profesionalId);
      }

      // $regex permite buscar "parte" de un texto (como un buscador de Google).
      // 'i' significa Case Insensitive (no importa mayúsculas o minúsculas).
      if (criteria.especialidad) {
        query['especialidad.nombre'] = {
          $regex: criteria.especialidad,
          $options: 'i' 
        };
      }

      if (criteria.practica) {
        query['practica.nombre'] = {
          $regex: criteria.practica,
          $options: 'i'
        };
      }

      if (criteria.sede) {
        query['sede.nombre'] = {
          $regex: criteria.sede,
          $options: 'i'
        };
      }

      // 3. FILTRO DE FECHAS
      if (criteria.fechaDesde || criteria.fechaHasta) {
        query.fechaHora = {};

        // $gte = "Greater Than or Equal" (Mayor o igual que).
        // Trae turnos desde esa fecha en adelante.
        if (criteria.fechaDesde) {
          query.fechaHora.$gte = new Date(criteria.fechaDesde);
        }

        // $lte = "Less Than or Equal" (Menor o igual que).
        // Trae turnos hasta esa fecha máximo.
        if (criteria.fechaHasta) {
          query.fechaHora.$lte = new Date(criteria.fechaHasta);
        }
      } else {
        // Si no mandan fechas, por defecto filtramos para que solo muestre
        // turnos desde "ahora" hacia el futuro ($gte: new Date()).
        query.fechaHora = { $gte: new Date() };
      }

      logger.debug('Query construida:', query);

      // 4. PREPARACIÓN DE LA QUERY EN MONGOOSE
      // TurnoModel.find(query) prepara la búsqueda pero NO la ejecuta todavía.
      let mongoQuery = TurnoModel.find(query);

      // 5. ORDENAMIENTO
      if (sortParams) {
        const { sortBy, sortOrder } = sortParams;

        // Si el usuario pide ordenar por 'fecha', en la DB el campo se llama 'fechaHora'.
        const campo = sortBy === 'fecha' ? 'fechaHora' : sortBy;

        // sort({ campo: 1 }) -> Ascendente (A-Z, 1-10)
        // sort({ campo: -1 }) -> Descendente (Z-A, 10-1)
        mongoQuery = mongoQuery.sort({
          [campo]: sortOrder === 'desc' ? -1 : 1
        });
      }

      // 6. PAGINACIÓN
      if (paginationParams) {
        const { page, limit } = paginationParams;

        // skip: cuántos registros saltarse. 
        // Si estás en la página 2 y el límite es 10, te saltas los primeros 10.
        const skip = (page - 1) * limit;

        mongoQuery = mongoQuery
          .skip(skip)
          .limit(limit); // limit: cuántos resultados traer como máximo.
      }

      // 7. EJECUCIÓN FINAL
      // populate('medico') busca los datos del médico (nombre, etc) usando su ID.
      // .exec() ejecuta la consulta finalmente en la base de datos.
      const data = await mongoQuery.populate('medico').exec();

      // 8. CONTEO TOTAL
      // Necesitamos saber cuántos hay en total (sin paginar) para que el frontend 
      // sepa cuántas páginas mostrar.
      const total = await TurnoModel.countDocuments(query);

      return {
        data,
        total
      };
    } catch (error) {
      logger.error('Error en BusquedaTurnosRepository.buscar:', error);
      throw new Error('Error al consultar los turnos en la base de datos');
    }
  }
}
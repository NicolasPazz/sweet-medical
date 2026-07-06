import { obraSocialService } from '../services/ObraSocialService.js';
import { ValidadorId } from '../utils/ValidadorId.js';

export class ObraSocialController {
  constructor({ obraSocialService: svc = obraSocialService } = {}) {
    this.obraSocialService = svc;
  }

  obtenerTodos = async (req, res, next) => {
    try {
      const resultado = await this.obraSocialService.obtenerTodos();
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };

  obtenerPorId = async (req, res, next) => {
    try {
      const { id } = req.params;
      ValidadorId.validarIds(id);
      const resultado = await this.obraSocialService.obtenerPorId(id);
      return res.status(200).json({ status: 'success', data: resultado });
    } catch (error) {
      return next(error);
    }
  };
}

export const obraSocialController = new ObraSocialController();

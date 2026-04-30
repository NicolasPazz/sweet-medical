import { logger } from "../domain/utils/logger.js";
import { ServicioService } from "../services/ServicioService.js";

// Al guardar servicios en Mongo, vamos a usar campo discriminante tipo (ESPECIALIDAD o PRACTICA)
export class ServicioController {
  constructor({ servicioService = new ServicioService() } = {}) {
    this.servicioService = servicioService;
  }

  agregar = async (req, res) => {
    try {
      const datosServicio = this.extraerYValidarBodyServicio(req.body);
      const servicioAgregado = this.servicioService.agregar(datosServicio);
      return res.status(201).json({ status: "success", data: servicioAgregado });
    } catch (error) {
      logger.error(error);
    }
  };

  modificar = async (req, res) => {
    try {
      const { id } = req.params;
      const datosActualizados = this.extraerYValidarBodyServicio(req.body);
      const servicioModificado = this.servicioService.modificar(id, datosActualizados);
      return res.status(200).json({ status: "success", data: servicioModificado });
    } catch (error) {
      logger.error(error);
    }
  };

  eliminar = async (req, res) => {
    try {
      const { id } = req.params;
      this.servicioService.eliminar(id);
      return res.status(200).send();
    } catch (error) {
      logger.error(error);
    }
  };

  extraerYValidarBodyServicio(body) {
    // TODO validaciones
    return {
      codigo: body.codigo,
      nombre: body.nombre,
      duracionTurnoEnMins: body.duracionTurnoEnMins,
      costo: body.costo,
      tipo: body.tipo,
    };
  }
}

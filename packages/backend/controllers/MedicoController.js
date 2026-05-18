import { MedicoService } from '../services/MedicoService.js';
import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { DiaSemana } from '../utils/enum/DiaSemana.js';
import { Disponible } from "../domain/notificacion/estado-turno/Disponible.js";

export class MedicoController {
  constructor({ medicoService = new MedicoService() } = {}) {
    this.medicoService = medicoService;
    this.medicoRepository = medicoRepository;
  }

  leerMedicos = async (req, res, next) => {
    try {
      const medicos = await this.medicoRepository.findAll();

      const dataParaEnviar = medicos.map((m) => ({
        id_usuario: m.usuario?.id || m.usuario?._id,
        id_medico: m.id || m._id,
        nombre: m.nombre,
        especialidades: m.especialidades,
        practicas: m.practicas,
        disponibilidades: m.disponibilidades,
        turnos: m.turnosActualesYFuturos.filter(t => t.estado instanceof Disponible).map((turno) => ({
          id: turno.id || turno._id,
          fecha: turno.fechaHora ? turno.fechaHora : 'N/A', // El objeto Date completo [cite: 1145]
          medico: turno.medico.nombre,
          servicio: turno.servicio
            ? {
                nombre: turno.servicio.nombre,
                codigo: turno.servicio.codigo || null,
                id: turno.servicio ? turno.servicio._id : "N/A"
              }
            : 'N/A',
          sede: turno.sede ? turno.sede.nombre : 'N/A', // Solo el nombre de la sede para evitar objetos pesados [cite: 1201]
          estado: turno.estado ? turno.estado.constructor.name : 'N/A',
          costoPaciente: turno.costo, // Monto ya calculado según el plan [cite: 2337]
          horario: turno.hora,
          diaSemana: turno.diaSemana,
        })),
      }));

      return res.status(200).json({
        status: 'success',
        data: dataParaEnviar,
      });
    } catch (error) {
      return next(error);
    }
  };

  actualizarDisponibilidad = async (req, res, next) => {
    try {
      const { disponibilidades, id_medico } = req.body;

      ValidadorId.validarIds(id_medico);

      if (!Array.isArray(disponibilidades)) {
        throw new BadRequestError('Se esperaba una lista de disponibilidades');
      }

      const formatoValido = disponibilidades.every(
        (item) =>
          item.diaSemana &&
          typeof item.horaDesde === 'string' &&
          typeof item.horaHasta === 'string',
      );

      if (!formatoValido) {
        throw new BadRequestError('Uno o más elementos no cumplen con el formato requerido');
      }

      if (
        !disponibilidades.every((d) =>
          Object.values(DiaSemana).includes(d.diaSemana.trim().toUpperCase()),
        )
      ) {
        throw new BadRequestError('Días de semana no válidos recibidos');
      }

      await this.medicoService.actualizarDisponibilidad(id_medico, disponibilidades);

      return res
        .status(200)
        .json({ status: 'success', message: 'Disponibilidad actualizada exitosamente' });
    } catch (error) {
      return next(error);
    }
  };
}

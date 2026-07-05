import { medicoService } from '../services/MedicoService.js';
import { ValidadorId } from '../utils/ValidadorId.js';
import { DiaSemana } from '../utils/enum/DiaSemana.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { DateUtil } from '../utils/DateUtil.js';

export class MedicoController {
  constructor({ medicoService: svc = medicoService } = {}) {
    this.medicoService = svc;
  }

  leerMedicos = async (req, res, next) => {
    try {
      const medicos = await this.medicoService.leerTodos();

      const dataParaEnviar = medicos.map((m) => ({
        id_usuario: m.usuario?.id || m.usuario?._id,
        id_medico: m.id || m._id,
        nombre: m.nombre,
        matricula: m.matricula,
        especialidades: m.especialidades,
        practicas: m.practicas,
        disponibilidades: m.disponibilidades,
        turnos: m.turnosActualesYFuturos.map((turno) => ({
          id: turno.id || turno._id,
          fecha: turno.fechaHora ? turno.fechaHora : 'N/A', // El objeto Date completo [cite: 1145]
          medico: turno.medico.nombre,
          servicio: turno.servicio
            ? {
              nombre: turno.servicio.nombre,
              codigo: turno.servicio.codigo || 'N/A',
              id: turno.servicio ? turno.servicio._id : 'N/A',
            }
            : 'N/A',
          sede: turno.sede ? turno.sede.nombre : 'N/A', // Solo el nombre de la sede para evitar objetos pesados [cite: 1201]
          estado: turno.estado ? turno.estado.getEstadoNombre() : 'N/A',
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
      const { disponibilidades } = req.body;

      const usuario = req.usuarioAutenticado;

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

      await this.medicoService.actualizarDisponibilidad(usuario, disponibilidades);

      return res
        .status(200)
        .json({ status: 'success', message: 'Disponibilidad actualizada exitosamente' });
    } catch (error) {
      return next(error);
    }
  };

  obtenerSedesMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const medico = await this.medicoService.findByIdUsuario(usuario.id);
      if (!medico) throw new NotFoundError('Médico no encontrado');
      return res.status(200).json({ status: 'success', data: medico.sedes ?? [] });
    } catch (error) {
      return next(error);
    }
  };

  agregarSedeMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const { nombre, direccion } = req.body;

      if (!nombre || !direccion) {
        throw new BadRequestError('nombre y direccion son obligatorios');
      }

      const medico = await this.medicoService.agregarSede(usuario.id, { nombre, direccion });
      return res.status(201).json({ status: 'success', data: medico });
    } catch (error) {
      return next(error);
    }
  };

  obtenerTurnosMe = async (req, res, next) => {
    try {
      const usuario = req.usuarioAutenticado;
      const medico = await this.medicoService.findByIdUsuario(usuario.id);
      if (!medico) throw new NotFoundError('Médico no encontrado');

      
      const turnos = (medico.turnosActualesYFuturos ?? []).map((turno) => ({
        _id: turno.id || turno._id,
        fechaHora: turno.fechaHora,
        hora: turno.hora,
        estado: typeof turno.estado === 'object' ? turno.estado.getEstadoNombre?.() ?? turno.estado.nombre ?? String(turno.estado) : turno.estado,
        costo: turno.costo,
        paciente: turno.paciente ? { nombre: turno.paciente.nombre ?? 'N/A' } : null,
        servicio: turno.practica
          ? { nombre: turno.practica.nombre }
          : turno.especialidad
          ? { nombre: turno.especialidad.nombre }
          : turno.servicio
          ? { nombre: turno.servicio.nombre ?? 'N/A' }
          : null,
        // IDs para poder pedirle al backend disponibilidad real al reprogramar
        // (mismo servicio, mismo médico = el propio usuario autenticado).
        servicio_id: turno.servicio ? String(turno.servicio._id) : null,
        servicio_tipo: turno.servicio?.esTipo ? turno.servicio.esTipo() : null,
        medico_id: String(medico.id || medico._id),
        sede: turno.sede ? { nombre: turno.sede.nombre ?? 'N/A' } : null,
        // Antes se pasaba `turno.propuestaCambio` crudo: el objeto de dominio
        // solo tiene `nuevaFechaHora` (no `nuevaHora`), así que el frontend
        // (que muestra `propuestaCambio.nuevaHora`) siempre recibía undefined
        // y quedaba "... hs" vacío. Derivamos nuevaHora acá igual que en
        // TurnoService._mapearTurno.
        propuestaCambio:
          turno.propuestaCambio && turno.propuestaCambio.nuevaFechaHora
            ? {
                nuevaFechaHora: turno.propuestaCambio.nuevaFechaHora,
                nuevaHora: DateUtil.toHHMM(turno.propuestaCambio.nuevaFechaHora),
                motivo: turno.propuestaCambio.motivo,
                proponenteId: turno.propuestaCambio.proponenteId,
              }
            : null,
      }));

      return res.status(200).json({ status: 'success', data: turnos });
    } catch (error) {
      return next(error);
    }
  };

  getMedicoByUsuario = async (req, res, next) => {

    try {

      const usuario = req.usuarioAutenticado;

      const medico = await this.medicoService.findByIdUsuario(usuario.id);

      return res.status(200).json({
        id: medico.id,
        nombre: medico.nombre,
        matricula: medico.matricula,
        disponibilidades: medico.disponibilidades
      })

    }
    catch (error) {
      return next(error);
    }
  }

}

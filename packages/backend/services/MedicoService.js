import { medicoRepository } from '../infrastructure/repositories/MedicoRepository.js';
import { usuarioService } from './UsuarioService.js';
import { ConflictError, NotFoundError, BadRequestError } from '../errors/AppError.js';
import { DateUtil } from '../utils/DateUtil.js';

export class MedicoService {
  constructor({
    medicoRepository: medicoRepo = medicoRepository,
    usuarioService: usuarioSvc = usuarioService,
  } = {}) {
    this.medicoRepository = medicoRepo;
    this.usuarioService = usuarioSvc;
  }

  async findByDni(dni) {
    return await this.medicoRepository.findByDni(dni);
  }

  async findByUsuarioId(usuarioId) {
    return await this.medicoRepository.findByUsuarioId(usuarioId);
  }

  async findById(id) {
    return await this.medicoRepository.findById(id);
  }

  async agregarSede(usuarioId, { nombre, direccion }) {
    const medico = await this.medicoRepository.findByIdUsuario(usuarioId);
    if (!medico) throw new NotFoundError('Médico no encontrado');

    // Crear la sede
    const { sedeRepository } = await import('../infrastructure/repositories/SedeRepository.js');
    const sedeExistente = await sedeRepository.findAll().then((sedes) =>
      sedes.find((s) => s.nombre.toLowerCase() === nombre.toLowerCase()),
    );

    const sede = sedeExistente ?? await sedeRepository.save({ nombre, direccion });

    // Verificar que no la tenga ya
    const yaLaTiene = medico.sedes?.some(
      (s) => (s._id ?? s.id ?? s)?.toString() === (sede._id ?? sede.id)?.toString(),
    );
    if (yaLaTiene) throw new ConflictError(`El médico ya tiene la sede "${nombre}"`);

    medico.sedes = [...(medico.sedes ?? []), sede];
    await this.medicoRepository.save(medico);
    return medico;
  }

  async findByIdUsuario(usuarioId) {
    return await this.medicoRepository.findByIdUsuario(usuarioId);
  }

  async findAll() {
    return await this.medicoRepository.findAll();
  }

  async save(medico) {
    return await this.medicoRepository.save(medico);
  }

  async leerTodos() {
    return await this.medicoRepository.findAll();
  }

  /**
   * Actualiza la disponibilidad del médico.
   *
   * IMPORTANTE: `disponibilidades` llega en hora LOCAL del navegador de quien
   * hizo la solicitud (tal cual la tipeó el médico en el formulario). Este
   * método la valida en esos términos (para que los mensajes de error tengan
   * sentido para el usuario) y recién después la convierte a UTC usando
   * `offsetMinutos` (el resultado de `new Date().getTimezoneOffset()` en el
   * navegador que hizo la request) antes de persistirla. Todo lo que se
   * guarda en base queda siempre en UTC.
   *
   * @param {object} usuario
   * @param {Array<{diaSemana:string, horaDesde:string, horaHasta:string}>} disponibilidades - en hora local
   * @param {number} [offsetMinutos=0] - `Date.prototype.getTimezoneOffset()` del navegador emisor
   */
  async actualizarDisponibilidad(usuario, disponibilidades, offsetMinutos = 0) {
    const medico = await this.medicoRepository.findByIdUsuario(usuario.id);

    if (medico == null) {
      throw new NotFoundError('Medico no encontrado');
    }

    const normalizadas = disponibilidades.map((d) => ({
      ...d,
      diaSemana: d.diaSemana.trim().toUpperCase(),
    }));

    const toMin = (hora) => {
      const [h, m] = hora.split(':').map(Number);
      return h * 60 + m;
    };

    // Agrupar por día y dentro de cada día verificar que no haya franjas
    // contenidas o exactamente iguales a otra.
    // Esta validación se hace SIEMPRE sobre las franjas en hora LOCAL (tal
    // cual las cargó el médico), no sobre el resultado convertido a UTC —
    // así los mensajes de error ("la franja 08:00-10:00 está contenida en...")
    // tienen sentido para quien los está leyendo.
    const porDia = {};
    for (const franja of normalizadas) {
      const dia = franja.diaSemana;
      if (!porDia[dia]) porDia[dia] = [];
      porDia[dia].push(franja);
    }

    for (const [dia, franjas] of Object.entries(porDia)) {
      const ordenadas = [...franjas].sort(
        (a, b) => toMin(a.horaDesde) - toMin(b.horaDesde),
      );

      for (let i = 0; i < ordenadas.length; i++) {
        for (let j = 0; j < ordenadas.length; j++) {
          if (i === j) continue;

          const a = ordenadas[i];
          const b = ordenadas[j];

          const desdeA = toMin(a.horaDesde);
          const hastaA = toMin(a.horaHasta);
          const desdeB = toMin(b.horaDesde);
          const hastaB = toMin(b.horaHasta);

          // A está contenida en B (incluyendo iguales)
          if (desdeA >= desdeB && hastaA <= hastaB && i !== j) {
            throw new BadRequestError(
              `En ${dia}: la franja ${a.horaDesde}-${a.horaHasta} está contenida o es igual a ${b.horaDesde}-${b.horaHasta}. Fusionalas antes de guardar.`,
            );
          }
        }
      }
    }

    // Conversión a UTC recién acá, para persistir. Una franja puede convertirse
    // en 2 si el offset la hace cruzar la medianoche (ver DateUtil).
    const enUTC = normalizadas.flatMap((franja) =>
      DateUtil.convertirDisponibilidadAUTC(franja, offsetMinutos),
    );

    medico.disponibilidades = enUTC;

    await this.medicoRepository.save(medico);

    return medico;
  }

  async eliminarEspecialidadDeMedico(medicoId, especialidadId) {
    return await this.medicoRepository.eliminarEspecialidadDeMedico(medicoId, especialidadId);
  }

  async agregarPracticaAMedico(medicoId, practicaId) {
    return await this.medicoRepository.agregarPracticaAMedico(medicoId, practicaId);
  }

  async eliminarPracticaDeMedico(medicoId, practicaId) {
    return await this.medicoRepository.eliminarPracticaDeMedico(medicoId, practicaId);
  }

  async agregarEspecialidadAMedico(medicoId, especialidadId) {
    return await this.medicoRepository.agregarEspecialidadAMedico(medicoId, especialidadId);
  }

  async crearMedico(data) {
    if (!data?.usuario || !data?.matricula || !data?.nombre) {
      throw new Error('Faltan datos obligatorios para crear el médico (usuario, matricula, nombre)');
    }

    const medicoExistente = await this.medicoRepository.findByMatricula(data.matricula);
    if (medicoExistente) {
      throw new ConflictError(`Ya existe un medico con matricula ${data.matricula}`);
    }

    const usuarioId = data.usuario?._id ?? data.usuario?.id ?? data.usuario;

    const medico = await this.medicoRepository.save({
      usuario: usuarioId,
      matricula: data.matricula,
      nombre: data.nombre,
      especialidades: data.especialidades || [],
      practicas: data.practicas || [],
      sedes: data.sedes || [],
      disponibilidades: [],
    });

    return medico;
  }

}

export const medicoService = new MedicoService();

import { NotFoundError } from '../../errors/AppError.js';
import { MedicoModel } from '../schemas/MedicoSchema.js';
import { Medico } from '../../domain/usuario/Medico.js';
import { turnoRepository } from './TurnoRepository.js';

export class MedicoRepository {

  fromDB(datos) {
    const medico = Object.create(Medico.prototype);
    medico.id = datos._id ?? datos.id;
    medico.usuario = datos.usuario;
    medico.matricula = datos.matricula;
    medico.nombre = datos.nombre;
    medico.especialidades = datos.especialidades ?? [];
    medico.practicas = datos.practicas ?? [];
    medico.sedes = datos.sedes ?? [];
    medico.disponibilidades = datos.disponibilidades ?? [];
    medico.turnosActualesYFuturos = Array.isArray(datos.turnosActualesYFuturos)
      ? datos.turnosActualesYFuturos.map((t) => turnoRepository._hidratarEstado(t))
      : [];
    return medico;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(medico) {
    if (medico._id || medico.id) {
      const id = medico._id ?? medico.id;
      const guardado = await MedicoModel.findByIdAndUpdate(id, medico, { new: true })
        .populate('usuario')
        .populate('especialidades')
        .populate('practicas')
        .populate('sedes')
        .populate('turnosActualesYFuturos')
        .lean();
      return this.fromDB(guardado);
    } else {
      const nuevo = await MedicoModel.create(medico);
      const guardado = await MedicoModel.findById(nuevo._id)
        .populate('usuario')
        .lean();
      return this.fromDB(guardado);
    }
  }

  async saveAll(medicos) {
    const docs = await MedicoModel.insertMany(medicos);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const medico = await MedicoModel.findById(id)
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
    if (!medico) throw new NotFoundError('Médico no encontrado');
    return this.fromDB(medico);
  }

  async findByIdUsuario(usuarioId) {
    const medico = await MedicoModel.findOne({ usuario: usuarioId })
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
    if (!medico) throw new NotFoundError('Médico no encontrado');
    return this.fromDB(medico);
  }

  async findByMatricula(matricula) {
    const medico = await MedicoModel.findOne({ matricula }).lean();
    if (!medico) return null;
    return this.fromDB(medico);
  }

  async findAll() {
    const medicos = await MedicoModel.find()
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
    return this._hidratarColeccion(medicos);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const medico = await MedicoModel.findByIdAndUpdate(id, datosActualizados, { new: true })
      .populate('usuario')
      .populate('especialidades')
      .populate('practicas')
      .populate('sedes')
      .populate('turnosActualesYFuturos')
      .lean();
    if (!medico) throw new NotFoundError('Médico no encontrado');
    return this.fromDB(medico);
  }

  // ELIMINAR
  async delete(id) {
    const result = await MedicoModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Médico no encontrado');
    return true;
  }

  async deleteAll() {
    await MedicoModel.deleteMany({});
  }
}

export const medicoRepository = new MedicoRepository();

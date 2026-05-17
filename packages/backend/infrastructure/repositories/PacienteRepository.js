import { NotFoundError } from '../../errors/AppError.js';
import { PacienteModel } from '../schemas/PacienteSchema.js';
import { Paciente } from '../../domain/usuario/Paciente.js';

export class PacienteRepository {
  fromDB(datos) {
    const paciente = Object.create(Paciente.prototype);
    paciente.id = datos._id ?? datos.id;
    paciente.usuario = datos.usuario;
    paciente.dni = datos.dni;
    paciente.nombre = datos.nombre;
    paciente.obraSocial = datos.obraSocial ?? null;
    paciente.plan = datos.plan ?? null;
    return paciente;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(paciente) {
    if (paciente._id || paciente.id) {
      const id = paciente._id ?? paciente.id;
      const guardado = await PacienteModel.findByIdAndUpdate(id, paciente, { new: true })
        .populate('usuario')
        .populate('obraSocial')
        .populate('plan')
        .lean();
      return this.fromDB(guardado);
    } else {
      const nuevo = await PacienteModel.create(paciente);
      const guardado = await PacienteModel.findById(nuevo._id)
        .populate('usuario')
        .populate('obraSocial')
        .populate('plan')
        .lean();
      return this.fromDB(guardado);
    }
  }

  async saveAll(pacientes) {
    const docs = await PacienteModel.insertMany(pacientes);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const paciente = await PacienteModel.findById(id)
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();
    if (!paciente) throw new NotFoundError('Paciente no encontrado');
    return this.fromDB(paciente);
  }

  async findByIdUsuario(usuarioId) {
    const paciente = await PacienteModel.findOne({ usuario: usuarioId })
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();
    if (!paciente) throw new NotFoundError('Paciente no encontrado');
    return this.fromDB(paciente);
  }

  async findAll() {
    const pacientes = await PacienteModel.find()
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();
    return this._hidratarColeccion(pacientes);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const paciente = await PacienteModel.findByIdAndUpdate(id, datosActualizados, { new: true })
      .populate('usuario')
      .populate('obraSocial')
      .populate('plan')
      .lean();
    if (!paciente) throw new NotFoundError('Paciente no encontrado');
    return this.fromDB(paciente);
  }

  // ELIMINAR
  async delete(id) {
    const result = await PacienteModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Paciente no encontrado');
    return true;
  }

  async deleteAll() {
    await PacienteModel.deleteMany({});
  }
}

export const pacienteRepository = new PacienteRepository();

import { NotFoundError } from '../../errors/AppError.js';
import { EspecialidadModel } from '../schemas/EspecialidadSchema.js';
import { Especialidad } from '../../domain/servicios/Especialidad.js';

export class EspecialidadRepository {

  fromDB(datos) {
    const especialidad = Object.create(Especialidad.prototype);
    especialidad.id = datos._id ?? datos.id;
    especialidad.nombre = datos.nombre;
    especialidad.duracionTurnoEnMins = datos.duracionTurnoEnMins;
    especialidad.costo = datos.costo;
    return especialidad;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(especialidad) {
    if (especialidad._id || especialidad.id) {
      const id = especialidad._id ?? especialidad.id;
      const guardada = await EspecialidadModel.findByIdAndUpdate(id, especialidad, { new: true }).lean();
      return this.fromDB(guardada);
    } else {
      const nueva = await EspecialidadModel.create(especialidad);
      const guardada = await EspecialidadModel.findById(nueva._id).lean();
      return this.fromDB(guardada);
    }
  }

  async saveAll(especialidades) {
    const docs = await EspecialidadModel.insertMany(especialidades);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const especialidad = await EspecialidadModel.findById(id).lean();
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return this.fromDB(especialidad);
  }

  async findAll() {
    const especialidades = await EspecialidadModel.find().lean();
    return this._hidratarColeccion(especialidades);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const especialidad = await EspecialidadModel.findByIdAndUpdate(id, datosActualizados, { new: true }).lean();
    if (!especialidad) throw new NotFoundError('Especialidad no encontrada');
    return this.fromDB(especialidad);
  }

  // ELIMINAR
  async delete(id) {
    const result = await EspecialidadModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Especialidad no encontrada');
    return true;
  }

  async deleteAll() {
    await EspecialidadModel.deleteMany({});
  }
}

export const especialidadRepository = new EspecialidadRepository();

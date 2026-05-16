import { NotFoundError } from '../../errors/AppError.js';
import { SedeModel } from '../schemas/SedeSchema.js';
import { Sede } from '../../domain/servicios/Sede.js';

export class SedeRepository {

  fromDB(datos) {
    const sede = Object.create(Sede.prototype);
    sede.id = datos._id ?? datos.id;
    sede.nombre = datos.nombre;
    sede.direccion = datos.direccion;
    return sede;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(sede) {
    if (sede._id || sede.id) {
      const id = sede._id ?? sede.id;
      const guardada = await SedeModel.findByIdAndUpdate(id, sede, { new: true }).lean();
      return this.fromDB(guardada);
    } else {
      const nueva = await SedeModel.create(sede);
      const guardada = await SedeModel.findById(nueva._id).lean();
      return this.fromDB(guardada);
    }
  }

  async saveAll(sedes) {
    const docs = await SedeModel.insertMany(sedes);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const sede = await SedeModel.findById(id).lean();
    if (!sede) throw new NotFoundError('Sede no encontrada');
    return this.fromDB(sede);
  }

  async findAll() {
    const sedes = await SedeModel.find().lean();
    return this._hidratarColeccion(sedes);
  }

  // ELIMINAR
  async delete(id) {
    const result = await SedeModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Sede no encontrada');
    return true;
  }

  async deleteAll() {
    await SedeModel.deleteMany({});
  }
}

export const sedeRepository = new SedeRepository();

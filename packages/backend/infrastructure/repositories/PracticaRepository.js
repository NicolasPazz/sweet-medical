import { NotFoundError } from '../../errors/AppError.js';
import { PracticaModel } from '../schemas/PracticaSchema.js';
import { Practica } from '../../domain/servicios/Practica.js';

export class PracticaRepository {

  fromDB(datos) {
    const practica = Object.create(Practica.prototype);
    practica.id = datos._id ?? datos.id;
    practica.codigo = datos.codigo;
    practica.nombre = datos.nombre;
    practica.duracionTurnoEnMins = datos.duracionTurnoEnMins;
    practica.costo = datos.costo;
    return practica;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(practica) {
    if (practica._id || practica.id) {
      const id = practica._id ?? practica.id;
      const guardada = await PracticaModel.findByIdAndUpdate(id, practica, { new: true }).lean();
      return this.fromDB(guardada);
    } else {
      const nueva = await PracticaModel.create(practica);
      const guardada = await PracticaModel.findById(nueva._id).lean();
      return this.fromDB(guardada);
    }
  }

  async saveAll(practicas) {
    const docs = await PracticaModel.insertMany(practicas);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const practica = await PracticaModel.findById(id).lean();
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return this.fromDB(practica);
  }

  async findAll() {
    const practicas = await PracticaModel.find().lean();
    return this._hidratarColeccion(practicas);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const practica = await PracticaModel.findByIdAndUpdate(id, datosActualizados, { new: true }).lean();
    if (!practica) throw new NotFoundError('Práctica no encontrada');
    return this.fromDB(practica);
  }

  // ELIMINAR
  async delete(id) {
    const result = await PracticaModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Práctica no encontrada');
    return true;
  }

  async deleteAll() {
    await PracticaModel.deleteMany({});
  }
}

export const practicaRepository = new PracticaRepository();

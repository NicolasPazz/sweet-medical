import { NotFoundError } from '../../errors/AppError.js';
import { ObraSocialModel } from '../schemas/ObraSocialSchema.js';
import { ObraSocial } from '../../domain/cobertura/ObraSocial.js';

export class ObraSocialRepository {
  fromDB(datos) {
    const obraSocial = Object.create(ObraSocial.prototype);
    obraSocial.id = datos._id ?? datos.id;
    obraSocial.nombre = datos.nombre;
    obraSocial.planes = datos.planes ?? [];
    return obraSocial;
  }

  _hidratarColeccion(datos) {
    return datos.map((d) => this.fromDB(d));
  }

  // CREAR
  async save(obraSocial) {
    if (obraSocial._id || obraSocial.id) {
      const id = obraSocial._id ?? obraSocial.id;
      const guardada = await ObraSocialModel.findByIdAndUpdate(id, obraSocial, { new: true })
        .populate('planes')
        .lean();
      return this.fromDB(guardada);
    } else {
      const nueva = await ObraSocialModel.create(obraSocial);
      const guardada = await ObraSocialModel.findById(nueva._id).populate('planes').lean();
      return this.fromDB(guardada);
    }
  }

  async saveAll(obrasSociales) {
    const docs = await ObraSocialModel.insertMany(obrasSociales);
    return this._hidratarColeccion(docs.map((d) => d.toObject()));
  }

  // LEER
  async findById(id) {
    const obraSocial = await ObraSocialModel.findById(id).populate('planes').lean();
    if (!obraSocial) throw new NotFoundError('Obra social no encontrada');
    return this.fromDB(obraSocial);
  }

  async findAll() {
    const obrasSociales = await ObraSocialModel.find().populate('planes').lean();
    return this._hidratarColeccion(obrasSociales);
  }

  // ELIMINAR
  async delete(id) {
    const result = await ObraSocialModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundError('Obra social no encontrada');
    return true;
  }

  async deleteAll() {
    await ObraSocialModel.deleteMany({});
  }
}

export const obraSocialRepository = new ObraSocialRepository();

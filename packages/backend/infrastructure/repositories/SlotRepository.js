import { SlotModel } from '../schemas/SlotSchema.js';

export class SlotRepository {
  constructor() {
    this.model = SlotModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findAllSlotsByMedicId(medicoId) {
    return await this.model.find({ medico: medicoId });
  }

  async findSlotsByMedicIdAndEstado(medicoId, estado) {
    return await this.model.find({ medico: medicoId, estado });
  }

  // CREAR / ACTUALIZAR
  async save(slot) {
    const id = slot.id || slot._id;

    if (id) {
      return await this.update(id, slot);
    }

    const nuevoSlot = new this.model(slot);
    return await nuevoSlot.save();
  }

  async saveAll(slots) {
    return await this.model.insertMany(slots);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    return await this.model.findByIdAndUpdate(
      id,
      {
        $set: {
          estado: datosActualizados.estado,
          turnoAsociado: datosActualizados.turnoAsociado ?? null,
        },
      },
      { new: true },
    );
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }
}

export const slotRepository = new SlotRepository();

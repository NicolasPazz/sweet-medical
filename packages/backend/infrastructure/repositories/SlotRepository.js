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

  async findByMedicFechaHora(medicoId, fecha, horaInicio) {
    return await this.model.findOne({
      medico: medicoId,
      fecha: fecha,
      horaInicio: horaInicio,
      estado: 'DISPONIBLE',
    });
  }

  // CONCURRENCIA: operación atómica de check-and-set. Solo transiciona el
  // slot a RESERVADO si en el momento exacto del update su estado en la DB
  // sigue siendo DISPONIBLE. Esto evita la race condition de "leer
  // DISPONIBLE -> reservar" cuando dos requests piden el mismo slot al mismo
  // tiempo: Mongo garantiza atomicidad a nivel documento en findOneAndUpdate,
  // así que solo uno de los dos requests puede ganar. El que pierde recibe
  // `null` y debe tratarlo como conflicto (slot ya tomado).
  async reservarSiDisponible(id, session = null) {
    return await this.model.findOneAndUpdate(
      { _id: id, estado: 'DISPONIBLE' },
      { $set: { estado: 'RESERVADO' } },
      { new: true, session },
    );
  }

  // Segundo paso atómico, separado de reservarSiDisponible: una vez que el
  // Turno ya tiene _id (recién se guarda en ese momento), asociamos el slot
  // al turno sin volver a tocar el campo `estado` (ya quedó en RESERVADO).
  async asignarTurnoAsociado(id, turnoId, session = null) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: { turnoAsociado: turnoId } },
      { new: true, session },
    );
  }

  // Operación atómica inversa a reservarSiDisponible, para cancelaciones /
  // liberación de slots.
  async liberarSlot(id, session = null) {
    return await this.model.findByIdAndUpdate(
      id,
      { $set: { estado: 'DISPONIBLE', turnoAsociado: null } },
      { new: true, session },
    );
  }

  // CREAR / ACTUALIZAR
  async save(slot, session = null) {
    const id = slot.id || slot._id;

    if (id) {
      return await this.update(id, slot, session);
    }

    const nuevoSlot = new this.model(slot);
    return await nuevoSlot.save({ session });
  }

  async saveAll(slots) {
    return await this.model.insertMany(slots);
  }

  async update(id, datosActualizados, session = null) {
    let sedeUpdate = null;
    if (datosActualizados.sede) {
      sedeUpdate = {
        _id: datosActualizados.sede._id || datosActualizados.sede.id_sede || null,
        nombre: datosActualizados.sede.nombre || null,
      };
    }

    return await this.model.findByIdAndUpdate(
      id,
      {
        $set: {
          estado: datosActualizados.estado,
          turnoAsociado: datosActualizados.turnoAsociado ?? null,
          sede: sedeUpdate,
        },
      },
      { new: true, session },
    );
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }

  async buscarSlotsDisponibles(filtros, limitesFechas) {
    const query = { estado: 'DISPONIBLE' };

    if (limitesFechas?.fechaDesde || limitesFechas?.fechaHasta) {
      query.fecha = {};
      if (limitesFechas.fechaDesde) query.fecha.$gte = limitesFechas.fechaDesde;
      if (limitesFechas.fechaHasta) query.fecha.$lte = limitesFechas.fechaHasta;
    }

    if (filtros?.medicoIds && filtros.medicoIds.length > 0) {
      query.medico = { $in: filtros.medicoIds };
    }

    return await this.model
      .find(query)
      .populate({ path: 'medico', populate: { path: 'sedes' } })
      .sort({ medico: 1, fecha: 1, horaInicio: 1 })
      .lean();
  }
}

export const slotRepository = new SlotRepository();

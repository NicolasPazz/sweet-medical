import { TurnoModel } from '../schemas/TurnoSchema.js';

export class TurnoRepository {
  constructor() {
    this.model = TurnoModel;
  }

  // LEER
  async findAll() {
    return await this.model.find();
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findAllByMedicId(medicId) {
    return await this.model.find({ medico: medicId });
  }

  async findAllByMedicIdAndEstado(medicId, estado) {
    const estadoValor = this._obtenerStringEstado(estado);
    return await this.model.find({ medico: medicId, estado: estadoValor });
  }

  async findDisponiblesByMedicIdAndServicioId(medicId, servicioId) {
    return await this.model.find({
      medico: medicId,
      estado: 'DISPONIBLE',
      'servicio._id': servicioId,
    });
  }

  async findAllForTomorrow(horaInicioManiana, horaFinManiana) {
    return await this.model.find({
      estado: 'RESERVADO',
      fechaHora: {
        $gte: horaInicioManiana,
        $lte: horaFinManiana,
      },
    });
  }

  async findAllByPatientId(pacienteId) {
    return await this.model.find({ paciente: pacienteId });
  }

  async findByMedicFechaHora(medicId, fechaHora) {
    return await this.model.findOne({
      medico: medicId,
      fechaHora: fechaHora,
    });
  }

  // CREAR
  async save(turno, session = null) {
    const id = turno.id || turno._id;

    if (id) {
      return await this.update(id, turno, session);
    }

    const nuevoTurno = new this.model(turno);
    nuevoTurno.slotsAsociados = (turno.slotsAsociados || []).map((s) => s._id || s.id || s);
    return await nuevoTurno.save({ session });
  }

  async saveAll(turnos) {
    return await this.model.insertMany(turnos);
  }

  // ACTUALIZAR
  async update(id, datosActualizados, session = null) {
    const estadoLimpio = this._obtenerStringEstado(datosActualizados.estado);

    const payload = datosActualizados._doc
      ? { ...datosActualizados._doc }
      : { ...datosActualizados };

    payload.estado = estadoLimpio;
    payload.slotsAsociados = (datosActualizados.slotsAsociados || []).map(
      (s) => s._id || s.id || s,
    );

    return await this.model.findByIdAndUpdate(id, payload, { new: true, session });
  }

  // ELIMINAR
  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteAll() {
    await this.model.deleteMany({});
  }

  _obtenerStringEstado(estado) {
    if (!estado) return null;
    if (typeof estado === 'string') return estado.toUpperCase();
    if (typeof estado.getEstadoNombre === 'function') return estado.getEstadoNombre();
    return estado.constructor?.name?.toUpperCase() || String(estado).toUpperCase();
  }
}

export const turnoRepository = new TurnoRepository();

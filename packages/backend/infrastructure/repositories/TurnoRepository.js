import { NotFoundError } from '../../errors/AppError.js';
import { TurnoModel } from '../schemas/TurnoSchema.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import { Disponible } from '../../domain/notificacion/estado-turno/Disponible.js';
import { Reservado } from '../../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../../domain/notificacion/estado-turno/Confirmado.js';
import { Cancelado } from '../../domain/notificacion/estado-turno/Cancelado.js';
import { Realizado } from '../../domain/notificacion/estado-turno/Realizado.js';

export class TurnoRepository {
  _obtenerValorEstado(estado) {
    if (!estado) return null;
    if (typeof estado === 'string') return estado.toUpperCase();
    if (typeof estado.getEstadoNombre === 'function') {
      return estado.getEstadoNombre();
    }
    if (estado instanceof Disponible) return EstadoTurno.DISPONIBLE;
    if (estado instanceof Reservado) return EstadoTurno.RESERVADO;
    if (estado instanceof Confirmado) return EstadoTurno.CONFIRMADO;
    if (estado instanceof Cancelado) return EstadoTurno.CANCELADO;
    if (estado instanceof Realizado) return EstadoTurno.REALIZADO;
    return String(estado).toUpperCase();
  }

  _hidratarEstado(turno) {
    if (!turno || !turno.estado) return turno;

    const estadoValor = String(turno.estado).toUpperCase();

    switch (estadoValor) {
      case EstadoTurno.DISPONIBLE:
        turno.estado = new Disponible(turno);
        break;
      case EstadoTurno.RESERVADO:
        turno.estado = new Reservado(turno);
        break;
      case EstadoTurno.CONFIRMADO:
        turno.estado = new Confirmado(turno);
        break;
      case EstadoTurno.CANCELADO:
        turno.estado = new Cancelado(turno);
        break;
      case EstadoTurno.REALIZADO:
        turno.estado = new Realizado(turno);
        break;
      default:
        throw new Error(`Estado de turno corrupto en la DB: ${estadoValor}`);
    }

    if (Array.isArray(turno.historialEstados)) {
      turno.historialEstados = turno.historialEstados.map((hist) => {
        if (!hist || !hist.estado) return hist;
        const estadoHist = String(hist.estado).toUpperCase();
        switch (estadoHist) {
          case EstadoTurno.DISPONIBLE:
            hist.estado = new Disponible(turno);
            break;
          case EstadoTurno.RESERVADO:
            hist.estado = new Reservado(turno);
            break;
          case EstadoTurno.CONFIRMADO:
            hist.estado = new Confirmado(turno);
            break;
          case EstadoTurno.CANCELADO:
            hist.estado = new Cancelado(turno);
            break;
          case EstadoTurno.REALIZADO:
            hist.estado = new Realizado(turno);
            break;
          default:
            throw new Error(`Historial corrupto en DB: ${estadoHist}`);
        }
        return hist;
      });
    }
    return turno;
  }

  _hidratarColeccion(turnos) {
    if (!Array.isArray(turnos)) {
      return this._hidratarEstado(turnos);
    }
    return turnos.map((turno) => this._hidratarEstado(turno));
  }

  _deshidratarTurno(turno) {
    const objeto = turno && typeof turno.toObject === 'function' ? turno.toObject() : { ...turno };

    if (objeto.estado) {
      objeto.estado = this._obtenerValorEstado(turno.estado);
    }
    if (objeto.medico && typeof objeto.medico === 'object') {
      objeto.medico = objeto.medico.id || objeto.medico._id;
    }
    if (objeto.paciente && typeof objeto.paciente === 'object') {
      objeto.paciente = objeto.paciente.id || objeto.paciente._id;
    }

    if (Array.isArray(objeto.historialEstados)) {
      objeto.historialEstados = objeto.historialEstados.map((historialEstado) => {
        if (!historialEstado) {
          return historialEstado;
        }

        const newHistorial = { ...historialEstado };
        if (newHistorial.estado) {
          newHistorial.estado = this._obtenerValorEstado(historialEstado.estado);
        }
        delete newHistorial.turno;
        if (newHistorial.usuario && typeof newHistorial.usuario === 'object') {
          newHistorial.usuario =
            newHistorial.usuario.id || newHistorial.usuario._id || '000000000000000000000000';
        }
        return newHistorial;
      });
    }

    return objeto;
  }

  // CREAR
  async save(turno) {
    const payload = this._deshidratarTurno(turno);

    if (payload._id) {
      const updated = await TurnoModel.findByIdAndUpdate(payload._id, payload, { new: true });
      return this._hidratarEstado(updated);
    } else {
      const newTurno = new TurnoModel(payload);
      const saved = await newTurno.save();
      return this._hidratarEstado(saved);
    }
  }

  async saveAll(turnos) {
    const docs = turnos.map((turno) => this._deshidratarTurno(turno));
    const saved = await TurnoModel.insertMany(docs);
    return this._hidratarColeccion(saved);
  }

  // LEER
  async findById(id) {
    const turno = await TurnoModel.findById(id).populate('medico').populate('paciente').lean();
    if (!turno) {
      throw new NotFoundError('Turno no encontrado');
    }
    return this._hidratarEstado(turno);
  }

  async findAll() {
    const turnos = await TurnoModel.find().populate('medico').populate('paciente').lean();
    return this._hidratarColeccion(turnos);
  }

  async findAllByMedicId(medicId) {
    const turnos = await TurnoModel.find({ medico: medicId }).populate('paciente').lean();
    return this._hidratarColeccion(turnos);
  }

  async findAllByMedicIdAndEstado(medicId, estado) {
    const estadoValor = this._obtenerValorEstado(estado);
    const turnos = await TurnoModel.find({ medico: medicId, estado: estadoValor })
      .populate('paciente')
      .lean();
    return this._hidratarColeccion(turnos);
  }

  async findDisponiblesByMedicIdAndServicioId(medicId, servicioId) {
    const turnos = await TurnoModel.find({
      medico: medicId,
      estado: EstadoTurno.DISPONIBLE,
      'servicio._id': servicioId,
    }).lean();
    return this._hidratarColeccion(turnos);
  }

  async findAllByPatientId(pacienteId) {
    const turnos = await TurnoModel.find({ paciente: pacienteId }).populate('medico').lean();
    return this._hidratarColeccion(turnos);
  }

  // ACTUALIZAR
  async update(id, datosActualizados) {
    const payload = this._deshidratarTurno(datosActualizados);
    const turno = await TurnoModel.findByIdAndUpdate(id, payload, { new: true }).lean();
    if (!turno) {
      throw new NotFoundError('Turno no encontrado');
    }
    return this._hidratarEstado(turno);
  }

  // ELIMINAR
  async delete(id) {
    const result = await TurnoModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundError('Turno no encontrado');
    }
    return true;
  }

  async deleteAll() {
    await TurnoModel.deleteMany({});
  }
}

export const turnoRepository = new TurnoRepository();

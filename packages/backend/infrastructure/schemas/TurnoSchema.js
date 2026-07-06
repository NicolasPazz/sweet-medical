import mongoose from 'mongoose';
import { Turno } from '../../domain/turno/Turno.js';
import { CambioEstadoTurno } from '../../domain/turno/CambioEstadoTurno.js';
import { EstadoTurno } from '../../domain/turno/EstadoTurno.js';
import { Disponible } from '../../domain/notificacion/estado-turno/Disponible.js';
import { Reservado } from '../../domain/notificacion/estado-turno/Reservado.js';
import { Confirmado } from '../../domain/notificacion/estado-turno/Confirmado.js';
import { Cancelado } from '../../domain/notificacion/estado-turno/Cancelado.js';
import { Realizado } from '../../domain/notificacion/estado-turno/Realizado.js';
import { PendienteReprogramacion } from '../../domain/notificacion/estado-turno/PendienteReprogramacion.js';

const cambioEstadoTurnoSchema = new mongoose.Schema(
  {
    fechaHoraIngreso: { type: Date, default: Date.now },
    estado: { type: String, required: true, trim: true, enum: Object.values(EstadoTurno) },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    motivo: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: true },
);

cambioEstadoTurnoSchema.loadClass(CambioEstadoTurno);

// Sub-schema del servicio embebido en el Turno (snapshot inmutable de la
// Especialidad/Practica al momento de reservar). No usa `loadClass` de
// Especialidad/Practica porque este objeto NO es una Especialidad/Practica
// completa (le faltan varios campos) — es sólo el snapshot definido acá.
// Por eso `esTipo()` se define explícitamente en este sub-schema: así
// `turno.servicio.esTipo()` funciona siempre para CUALQUIER turno persistido,
// sin necesidad de parches externos (turnoAdaptado, etc.) en los services.
const servicioEmbebidoSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    codigo: { type: String, trim: true },
    nombre: { type: String, required: true, trim: true, maxlength: 100 },
    costo: { type: Number, required: true, min: 0 },
    duracionTurnoEnMins: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

servicioEmbebidoSchema.methods.esTipo = function () {
  // Solo las Practicas tienen 'codigo' (ver domain/servicios/Practica.js vs Especialidad.js)
  return this.codigo ? 'PRACTICA' : 'ESPECIALIDAD';
};

const turnoSchema = new mongoose.Schema(
  {
    medico: { type: mongoose.Schema.Types.ObjectId, ref: 'Medico', required: true },
    paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente', default: null },
    servicio: servicioEmbebidoSchema,
    sede: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede' },
      nombre: { type: String, trim: true, maxlength: 100 },
    },
    hora: { type: String, required: true, trim: true, maxlength: 10 },
    fechaHora: { type: Date },
    estado: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(EstadoTurno),
      get: function (val) {
        return mapearAClaseEstado(val, this);
      },
      set: function (val) {
        if (val && typeof val.getEstadoNombre === 'function') return val.getEstadoNombre();
        return val;
      },
    },
    costo: { type: Number, required: true, min: 0 },
    slotsAsociados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Slot', default: [] }],
    historialEstados: [cambioEstadoTurnoSchema],

    propuestaCambio: {
      nuevaFechaHora: { type: Date, default: null },
      motivo: { type: String, default: null },
      proponenteId: { type: String, default: null },
    },
  },
  { collection: 'turnos' },
);

turnoSchema.pre(/^find/, function (next) {
  // Nota: antes acá se cortaba el populate de 'medico'/'paciente' cuando el turno
  // se traía desde el virtual `turnosActualesYFuturos` de Medico (flag _populatingFromMedico),
  // lo que dejaba esos campos como ObjectId sin hidratar. Se verificó que ni MedicoSchema,
  // ni PacienteSchema, ni sus dependencias (Usuario, Especialidad, Practica, Sede, ObraSocial,
  // Plan) vuelven a poblar 'turnosActualesYFuturos', por lo que no existe riesgo de recursión
  // infinita al poblar siempre estos campos.
  this.populate('medico')
    .populate('paciente')
    .populate('slotsAsociados')
    .populate({ path: 'historialEstados.usuario' });
  next();
});

function mapearAClaseEstado(estadoValor, turno) {
  switch (String(estadoValor).toUpperCase()) {
    case 'DISPONIBLE':
      return new Disponible(turno);
    case 'RESERVADO':
      return new Reservado(turno);
    case 'CONFIRMADO':
      return new Confirmado(turno);
    case 'CANCELADO':
      return new Cancelado(turno);
    case 'REALIZADO':
      return new Realizado(turno);
    case 'PENDIENTE_REPROGRAMACION':
      return new PendienteReprogramacion(turno);
    default:
      return estadoValor;
  }
}

turnoSchema.post('init', function (doc) {
  if (doc.estado) doc.estado = mapearAClaseEstado(doc.estado, doc);

  if (Array.isArray(doc.historialEstados)) {
    doc.historialEstados.forEach((historial) => {
      historial.turno = doc;
    });
  }
});

turnoSchema.index({ estado: 1, fechaHora: 1 });
turnoSchema.index({ medico: 1, estado: 1, fechaHora: 1 });
turnoSchema.index({ medico: 1, 'servicio._id': 1, estado: 1 });
turnoSchema.index({ 'servicio.nombre': 1 });
turnoSchema.index({ 'sede.nombre': 1 });

turnoSchema.loadClass(Turno);

export const TurnoModel = mongoose.model('Turno', turnoSchema);

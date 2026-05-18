import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { UsuarioModel } from './infrastructure/schemas/UsuarioSchema.js';
import { PacienteModel } from './infrastructure/schemas/PacienteSchema.js';
import { MedicoModel } from './infrastructure/schemas/MedicoSchema.js';
import { TurnoModel } from './infrastructure/schemas/TurnoSchema.js';
import { SedeModel } from './infrastructure/schemas/SedeSchema.js';
import { ObraSocialModel } from './infrastructure/schemas/ObraSocialSchema.js';
import { PlanPrepagaModel } from './infrastructure/schemas/PlanSchema.js';
import { EspecialidadModel } from './infrastructure/schemas/EspecialidadSchema.js';

dotenv.config();

async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}?authSource=admin`);
    console.log('Conectado.');

    console.log('Limpiando base de datos...');
    await TurnoModel.deleteMany({});
    await MedicoModel.deleteMany({});
    await PacienteModel.deleteMany({});
    await UsuarioModel.deleteMany({});
    await SedeModel.deleteMany({});
    await ObraSocialModel.deleteMany({});
    await PlanPrepagaModel.deleteMany({});
    await EspecialidadModel.deleteMany({});

    const servicioCardioId = new mongoose.Types.ObjectId();
    const servicioDermaId = new mongoose.Types.ObjectId();

    await EspecialidadModel.create({ _id: servicioCardioId, nombre: 'Cardiologia', duracionTurnoEnMins: 30, costo: 5000 });
    await EspecialidadModel.create({ _id: servicioDermaId, nombre: 'Dermatologia', duracionTurnoEnMins: 30, costo: 3000 });

    // Crear Obra Social y Planes
    const osde = await ObraSocialModel.create({ nombre: 'OSDE', codigo: 'OSDE01' });
    
    const planTotal = await PlanPrepagaModel.create({ 
      nombre: '310 - Total', 
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [{ especialidad: servicioCardioId, nivel: 'TOTAL' }],
      coberturasPractica: []
    });

    const planParcial = await PlanPrepagaModel.create({ 
      nombre: '210 - Parcial', 
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [{ especialidad: servicioCardioId, nivel: 'PARCIAL' }],
      coberturasPractica: []
    });

    const planNada = await PlanPrepagaModel.create({ 
      nombre: '110 - Basico', 
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [{ especialidad: servicioCardioId, nivel: 'NO_CUBIERTA' }],
      coberturasPractica: []
    });
    
    // Crear Usuarios y Pacientes
    const uP1 = await UsuarioModel.create({ nombreUsuario: 'pacienteTotal', password: 'password', roles: ['PACIENTE'] });
    const uP2 = await UsuarioModel.create({ nombreUsuario: 'pacienteParcial', password: 'password', roles: ['PACIENTE'] });
    const uP3 = await UsuarioModel.create({ nombreUsuario: 'pacienteNada', password: 'password', roles: ['PACIENTE'] });
    const userMedico = await UsuarioModel.create({ nombreUsuario: 'medico1', password: 'password', roles: ['MEDICO'] });

    const pTotal = await PacienteModel.create({ usuario: uP1._id, dni: '11111111', nombre: 'Juan Total', obraSocial: osde._id, plan: planTotal._id });
    const pParcial = await PacienteModel.create({ usuario: uP2._id, dni: '22222222', nombre: 'Maria Parcial', obraSocial: osde._id, plan: planParcial._id });
    const pNada = await PacienteModel.create({ usuario: uP3._id, dni: '33333333', nombre: 'Pedro Nada', obraSocial: osde._id, plan: planNada._id });

    const sede = await SedeModel.create({ nombre: 'Sede Central', direccion: 'Calle Falsa 123' });

    const medico = await MedicoModel.create({
      usuario: userMedico._id,
      matricula: 'MN1234',
      nombre: 'Dr. House',
      sedes: [sede._id]
    });

    // Crear Turnos Disponibles (Futuros)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    mañana.setHours(10, 0, 0, 0);

    const pasado = new Date();
    pasado.setDate(pasado.getDate() + 2);
    pasado.setHours(15, 0, 0, 0);

    const servicioCardio = {
      _id: servicioCardioId,
      nombre: 'Cardiologia',
      costo: 5000,
      duracionTurnoEnMins: 30
    };

    const servicioDerma = {
      _id: servicioDermaId,
      nombre: 'Dermatologia',
      costo: 3000,
      duracionTurnoEnMins: 30
    };

    const turnos = [
      {
        medico: medico._id,
        paciente: null,
        servicio: servicioCardio, // Es Especialidad porque codigo is null
        sede: { _id: sede._id, nombre: sede.nombre },
        diaSemana: 'MARTES',
        hora: '10:00',
        fechaHora: mañana,
        estado: 'DISPONIBLE',
        costo: 5000,
        historialEstados: []
      },
      {
        medico: medico._id,
        paciente: null,
        servicio: servicioCardio,
        sede: { _id: sede._id, nombre: sede.nombre },
        diaSemana: 'MARTES',
        hora: '10:30',
        fechaHora: new Date(mañana.getTime() + 30*60000), // 30 min despues
        estado: 'DISPONIBLE',
        costo: 5000,
        historialEstados: []
      },
      {
        medico: medico._id,
        paciente: null,
        servicio: servicioDerma,
        sede: { _id: sede._id, nombre: sede.nombre },
        diaSemana: 'MIERCOLES',
        hora: '15:00',
        fechaHora: pasado,
        estado: 'DISPONIBLE',
        costo: 3000,
        historialEstados: []
      }
    ];

    await TurnoModel.insertMany(turnos);
    console.log('✅ Base de datos poblada con 3 turnos disponibles y 3 pacientes de prueba.');
    
    console.log(`\n-- IDs Útiles para probar filtros de Cobertura --`);
    console.log(`Paciente TOTAL (Costo 0): ${pTotal._id}`);
    console.log(`Paciente PARCIAL (Costo 50%): ${pParcial._id}`);
    console.log(`Paciente NO CUBIERTO (Costo 100%): ${pNada._id}`);
    console.log(`\nPara probar, usar: ?pacienteIdTest=<ID>`);

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();

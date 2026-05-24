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
import { PracticaModel } from './infrastructure/schemas/PracticaSchema.js';
import { SlotModel } from './infrastructure/schemas/SlotSchema.js';

dotenv.config();

async function seed() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(
      `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}?authSource=admin`,
    );
    console.log('Conectado.');

    console.log('Limpiando base de datos...');
    await TurnoModel.deleteMany({});
    await SlotModel.deleteMany({});
    await MedicoModel.deleteMany({});
    await PacienteModel.deleteMany({});
    await UsuarioModel.deleteMany({});
    await SedeModel.deleteMany({});
    await ObraSocialModel.deleteMany({});
    await PlanPrepagaModel.deleteMany({});
    await EspecialidadModel.deleteMany({});
    await PracticaModel.deleteMany({});

    console.log('Creando Especialidades y Prácticas...');
    const servicioCardioId = new mongoose.Types.ObjectId();
    const servicioDermaId = new mongoose.Types.ObjectId();
    const servicioPediaId = new mongoose.Types.ObjectId();

    await EspecialidadModel.create({
      _id: servicioCardioId,
      nombre: 'Cardiologia',
      duracionTurnoEnMins: 30,
      costo: 5000,
    });
    await EspecialidadModel.create({
      _id: servicioDermaId,
      nombre: 'Dermatologia',
      duracionTurnoEnMins: 20,
      costo: 3000,
    });
    await EspecialidadModel.create({
      _id: servicioPediaId,
      nombre: 'Pediatria',
      duracionTurnoEnMins: 30,
      costo: 4000,
    });

    const practicaEcgoId = new mongoose.Types.ObjectId();
    const practicaRxId = new mongoose.Types.ObjectId();

    await PracticaModel.create({
      _id: practicaEcgoId,
      codigo: 'ECG-001',
      nombre: 'Electrocardiograma',
      duracionTurnoEnMins: 10,
      costo: 2500,
    });
    await PracticaModel.create({
      _id: practicaRxId,
      codigo: 'RX-002',
      nombre: 'Radiografia de Torax',
      duracionTurnoEnMins: 15,
      costo: 1800,
    });

    // Crear Obra Social y Planes
    const osde = await ObraSocialModel.create({ nombre: 'OSDE', codigo: 'OSDE01' });

    const planTotal = await PlanPrepagaModel.create({
      nombre: '310 - Total',
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [
        { especialidad: servicioCardioId, nivel: 'TOTAL' },
        { especialidad: servicioDermaId, nivel: 'TOTAL' },
      ],
      coberturasPractica: [
        { practica: practicaEcgoId, nivel: 'TOTAL' },
      ],
    });

    const planParcial = await PlanPrepagaModel.create({
      nombre: '210 - Parcial',
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [
        { especialidad: servicioCardioId, nivel: 'PARCIAL' },
        { especialidad: servicioDermaId, nivel: 'PARCIAL' },
      ],
      coberturasPractica: [
        { practica: practicaEcgoId, nivel: 'PARCIAL' },
      ],
    });

    const planNada = await PlanPrepagaModel.create({
      nombre: '110 - Basico',
      obraSocial: osde._id,
      tipoPlan: 'Prepaga',
      coberturasEspecialidad: [
        { especialidad: servicioCardioId, nivel: 'NO_CUBIERTA' },
        { especialidad: servicioDermaId, nivel: 'NO_CUBIERTA' },
      ],
      coberturasPractica: [
        { practica: practicaEcgoId, nivel: 'NO_CUBIERTA' },
      ],
    });

    // Crear Usuarios y Pacientes
    const uP1 = await UsuarioModel.create({
      nombreUsuario: 'pacienteTotal',
      password: 'password123',
      roles: ['PACIENTE'],
    });
    const uP2 = await UsuarioModel.create({
      nombreUsuario: 'pacienteParcial',
      password: 'password123',
      roles: ['PACIENTE'],
    });
    const uP3 = await UsuarioModel.create({
      nombreUsuario: 'pacienteNada',
      password: 'password123',
      roles: ['PACIENTE'],
    });

    const pTotal = await PacienteModel.create({
      usuario: uP1._id,
      dni: '11111111',
      nombre: 'Juan Total',
      obraSocial: osde._id,
      plan: planTotal._id,
    });
    const pParcial = await PacienteModel.create({
      usuario: uP2._id,
      dni: '22222222',
      nombre: 'Maria Parcial',
      obraSocial: osde._id,
      plan: planParcial._id,
    });
    const pNada = await PacienteModel.create({
      usuario: uP3._id,
      dni: '33333333',
      nombre: 'Pedro Nada',
      obraSocial: osde._id,
      plan: planNada._id,
    });

    // Crear Sedes
    const sedeCentral = await SedeModel.create({ nombre: 'Sede Central', direccion: 'Calle Falsa 123' });
    const sedeNorte = await SedeModel.create({ nombre: 'Sede Barrio Norte', direccion: 'Av Santa Fe 456' });

    // Crear Médicos
    const uM1 = await UsuarioModel.create({
      nombreUsuario: 'medicoHouse',
      password: 'password123',
      roles: ['MEDICO'],
    });
    const uM2 = await UsuarioModel.create({
      nombreUsuario: 'medicoWatson',
      password: 'password123',
      roles: ['MEDICO'],
    });
    const uM3 = await UsuarioModel.create({
      nombreUsuario: 'medicoCuddy',
      password: 'password123',
      roles: ['MEDICO'],
    });

    const medicoHouse = await MedicoModel.create({
      usuario: uM1._id,
      matricula: 'MN1234',
      nombre: 'Dr. House',
      especialidades: [servicioCardioId, servicioDermaId],
      practicas: [practicaEcgoId],
      sedes: [sedeCentral._id, sedeNorte._id],
    });

    const medicoWatson = await MedicoModel.create({
      usuario: uM2._id,
      matricula: 'MN5678',
      nombre: 'Dr. Watson',
      especialidades: [servicioCardioId, servicioPediaId],
      practicas: [practicaEcgoId],
      sedes: [sedeCentral._id],
    });

    const medicoCuddy = await MedicoModel.create({
      usuario: uM3._id,
      matricula: 'MN9012',
      nombre: 'Dra. Cuddy',
      especialidades: [servicioDermaId, servicioPediaId],
      practicas: [practicaRxId],
      sedes: [sedeNorte._id],
    });

    // Fechas de prueba (Mañana y Pasado mañana)
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaManiana = mañana.toISOString().split('T')[0];

    const pasado = new Date();
    pasado.setDate(pasado.getDate() + 2);
    const fechaPasado = pasado.toISOString().split('T')[0];

    const duracionSlot = parseInt(process.env.DURACION_SLOT_MINUTOS || '10', 10);
    const slotsPorHora = Math.floor(60 / duracionSlot);

    console.log('Generando Slots...');
    const slots = [];

    // 1. Dr. House - Mañana: 09:00 a 11:00 (12 slots de 10 min)
    for (let i = 0; i < slotsPorHora * 2; i++) {
      const hora = 9 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoHouse._id,
        fecha: fechaManiana,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    // 2. Dr. Watson - Mañana: 09:00 a 11:00 (12 slots de 10 min) - Mismo horario para simular paralelo!
    for (let i = 0; i < slotsPorHora * 2; i++) {
      const hora = 9 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoWatson._id,
        fecha: fechaManiana,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    // 3. Dra. Cuddy - Mañana: 14:00 a 15:30 (9 slots de 10 min)
    for (let i = 0; i < slotsPorHora * 1.5; i++) {
      const hora = 14 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoCuddy._id,
        fecha: fechaManiana,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    // 4. Dr. House - Pasado mañana: 15:00 a 16:30 (9 slots de 10 min)
    for (let i = 0; i < slotsPorHora * 1.5; i++) {
      const hora = 15 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoHouse._id,
        fecha: fechaPasado,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    // 5. Dr. Watson - Pasado mañana: 15:00 a 16:30 (9 slots de 10 min) - Mismo horario para simular paralelo!
    for (let i = 0; i < slotsPorHora * 1.5; i++) {
      const hora = 15 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoWatson._id,
        fecha: fechaPasado,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    // 6. Dra. Cuddy - Pasado mañana: 09:00 a 11:00 (12 slots de 10 min)
    for (let i = 0; i < slotsPorHora * 2; i++) {
      const hora = 9 + Math.floor(i / slotsPorHora);
      const min = (i % slotsPorHora) * duracionSlot;
      slots.push({
        medico: medicoCuddy._id,
        fecha: fechaPasado,
        horaInicio: `${hora.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        duracionMins: duracionSlot,
        estado: 'DISPONIBLE',
      });
    }

    await SlotModel.insertMany(slots);
    console.log(`✅ Base de datos poblada exitosamente.`);
    console.log(`- 3 Especialidades creadas (Cardiologia, Dermatologia, Pediatria).`);
    console.log(`- 2 Prácticas creadas (Electrocardiograma, Radiografia de Torax).`);
    console.log(`- 2 Sedes creadas (Sede Central, Sede Barrio Norte).`);
    console.log(`- 3 Médicos creados (Dr. House, Dr. Watson, Dra. Cuddy) con sus especialidades vinculadas.`);
    console.log(`- 3 Pacientes de prueba (Juan Total, Maria Parcial, Pedro Nada) con planes de OSDE.`);
    console.log(`- ${slots.length} slots de 10 minutos insertados.`);

    console.log(`\n================ ID MAP FOR TESTING ================`);
    console.log(`Especialidad Cardiología: ${servicioCardioId}`);
    console.log(`Especialidad Dermatología: ${servicioDermaId}`);
    console.log(`Especialidad Pediatría: ${servicioPediaId}`);
    console.log(`Práctica Electrocardiograma: ${practicaEcgoId}`);
    console.log(`Práctica Radiografía de Tórax: ${practicaRxId}`);
    console.log(`-----------------------------------------------------`);
    console.log(`Médico Dr. House: ${medicoHouse._id}`);
    console.log(`Médico Dr. Watson: ${medicoWatson._id}`);
    console.log(`Médico Dra. Cuddy: ${medicoCuddy._id}`);
    console.log(`-----------------------------------------------------`);
    console.log(`Paciente TOTAL (Juan Total): ${pTotal._id}`);
    console.log(`Paciente PARCIAL (Maria Parcial): ${pParcial._id}`);
    console.log(`Paciente NO CUBIERTO (Pedro Nada): ${pNada._id}`);
    console.log(`=====================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();

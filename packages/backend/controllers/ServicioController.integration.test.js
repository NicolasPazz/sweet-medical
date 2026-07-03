import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

const limpiarColecciones = async () => {
    await Promise.all([
        mongoose.connection.collection('especialidades').deleteMany({}),
        mongoose.connection.collection('practicas').deleteMany({}),
    ]);
};

describe('Integración API - ServicioController', () => {
    beforeEach(async () => {
        await limpiarColecciones();
    });

    afterEach(async () => {
        await limpiarColecciones();
    });

    it('GET /servicios debe responder 200 atravesando la ruta real, el controlador y la base de datos', async () => {
        const servicioMock = {
            nombre: 'Cardiología de Prueba',
            duracionTurnoEnMins: 30,
            costo: 5000,
            activo: true,
        };
        await mongoose.connection.collection('especialidades').insertOne(servicioMock);

        const response = await request(app)
            .get('/servicios')
            .set('Accept', 'application/json');

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].nombre).toBe('Cardiología de Prueba');
    });
});

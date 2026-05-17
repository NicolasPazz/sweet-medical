import request from 'supertest';
import app from '../../app.js';
import { usuarioRepository } from '../../infrastructure/repositories/UsuarioRepository.js';
import { Usuario } from '../usuario/Usuario.js';

// Para los endpoints de ABM de servicios, el service valida que el usuario
// que opera sea el usuario Sistema. Como el repo es en memoria, necesitamos
// registrarlo antes de correr los tests.

let idSistema;

// beforeAll corre una sola vez antes de todos los tests del archivo.
// Acá registramos al usuario Sistema en el repo para que los tests puedan usarlo.
beforeAll(async () => {
  const usuarioSistema = Usuario.USUARIO_SISTEMA;
  const guardado = await usuarioRepository.save(usuarioSistema);
  idSistema = guardado.id;
});

describe('POST /servicios (agregar)', () => {
  it('crea una Especialidad con datos válidos', async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Cardiología',
      duracionTurnoEnMins: 30,
      costo: 5000,
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
    expect(res.body.data).toMatchObject({
      nombre: 'Cardiología',
      duracionTurnoEnMins: 30,
      costo: 5000,
    });
    expect(res.body.data.id).toBeDefined();
  });

  it('crea una Práctica con datos válidos', async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'PRACTICA',
      codigo: 'RX-001',
      nombre: 'Radiografía de tórax',
      duracionTurnoEnMins: 15,
      costo: 2000,
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      codigo: 'RX-001',
      nombre: 'Radiografía de tórax',
    });
  });

  it('falla si el usuario no es Sistema', async () => {
    // Creamos un usuario cualquiera
    const otroUsuario = new Usuario('juan', '1234');
    const guardado = await usuarioRepository.save(otroUsuario);

    const res = await request(app).post('/servicios').send({
      idUsuario: guardado.id,
      tipo: 'ESPECIALIDAD',
      nombre: 'Dermatología',
      duracionTurnoEnMins: 20,
      costo: 3000,
    });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
  });

  it('falla si el tipo es inválido', async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'CONSULTA',
      nombre: 'Algo',
      duracionTurnoEnMins: 20,
      costo: 1000,
    });

    expect(res.status).toBe(400);
  });

  it('falla si una Práctica no tiene código', async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'PRACTICA',
      nombre: 'Eco abdominal',
      duracionTurnoEnMins: 20,
      costo: 1500,
    });

    expect(res.status).toBe(400);
  });

  it('falla si la duración no es un entero positivo', async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Neurología',
      duracionTurnoEnMins: -10,
      costo: 4000,
    });

    expect(res.status).toBe(400);
  });

  it('falla si falta el idUsuario', async () => {
    const res = await request(app).post('/servicios').send({
      tipo: 'ESPECIALIDAD',
      nombre: 'Neurología',
      duracionTurnoEnMins: 30,
      costo: 4000,
    });

    expect(res.status).toBe(400);
  });
});

describe('PATCH /servicios/:id (modificar)', () => {
  let idServicio;

  beforeAll(async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Oftalmología',
      duracionTurnoEnMins: 25,
      costo: 3500,
    });
    idServicio = res.body.data.id;
  });

  it('modifica el servicio con datos válidos', async () => {
    const res = await request(app).patch(`/servicios/${idServicio}`).send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Oftalmología Pediátrica',
      duracionTurnoEnMins: 30,
      costo: 4000,
    });

    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Oftalmología Pediátrica');
  });

  it('falla si el servicio no existe', async () => {
    const res = await request(app).patch('/servicios/99999').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Cualquiera',
      duracionTurnoEnMins: 20,
      costo: 1000,
    });

    expect(res.status).toBe(404);
  });

  it('falla si el usuario no es Sistema', async () => {
    const otroUsuario = new Usuario('pedro', 'pass');
    const guardado = await usuarioRepository.save(otroUsuario);

    const res = await request(app).patch(`/servicios/${idServicio}`).send({
      idUsuario: guardado.id,
      tipo: 'ESPECIALIDAD',
      nombre: 'Modificación no autorizada',
      duracionTurnoEnMins: 20,
      costo: 1000,
    });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /servicios/:id (eliminar)', () => {
  let idServicio;

  beforeAll(async () => {
    const res = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Servicio a eliminar',
      duracionTurnoEnMins: 20,
      costo: 1000,
    });
    idServicio = res.body.data.id;
  });

  it('elimina el servicio (baja lógica)', async () => {
    const res = await request(app)
      .delete(`/servicios/${idServicio}`)
      .send({ idUsuario: idSistema });

    expect(res.status).toBe(204);
  });

  it('después de eliminar, no lo encuentra por GET', async () => {
    const res = await request(app).get(`/servicios/${idServicio}`);

    expect(res.status).toBe(404);
  });

  it('falla al eliminar un servicio que no existe', async () => {
    const res = await request(app).delete('/servicios/99999').send({ idUsuario: idSistema });

    expect(res.status).toBe(404);
  });
});

describe('GET /servicios', () => {
  it('devuelve la lista de servicios activos', async () => {
    const res = await request(app).get('/servicios');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /servicios/:id', () => {
  it('devuelve el servicio si existe', async () => {
    // Primero creamos uno
    const crearRes = await request(app).post('/servicios').send({
      idUsuario: idSistema,
      tipo: 'ESPECIALIDAD',
      nombre: 'Reumatología',
      duracionTurnoEnMins: 40,
      costo: 6000,
    });
    const id = crearRes.body.data.id;

    const res = await request(app).get(`/servicios/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Reumatología');
  });

  it('falla si el servicio no existe', async () => {
    const res = await request(app).get('/servicios/99999');
    expect(res.status).toBe(404);
  });
});

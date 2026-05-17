import request from 'supertest';
import app from '../app.js';

// Supertest envuelve la app de Express y hace requests reales contra ella,
// sin necesidad de que el servidor esté escuchando en ningún puerto.
// Cada `request(app).post(...)` es equivalente a hacer un fetch contra el servidor real.

describe('POST /notificaciones', () => {
  it('crea una notificación con datos válidos', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: 1,
      remitente: 2,
      mensaje: 'Turno confirmado',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
    expect(res.body.data).toMatchObject({
      destinatario: 1,
      remitente: 2,
      mensaje: 'Turno confirmado',
      leida: false,
    });
    // El id lo asigna el repo, solo verificamos que exista
    expect(res.body.data.id).toBeDefined();
  });

  it('falla si falta el destinatario', async () => {
    const res = await request(app).post('/notificaciones').send({
      remitente: 2,
      mensaje: 'Turno confirmado',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('falla si el mensaje está vacío', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: 1,
      remitente: 2,
      mensaje: '   ',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('falla si el id del destinatario es negativo', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: -1,
      remitente: 2,
      mensaje: 'Hola',
    });

    expect(res.status).toBe(400);
  });
});

// Para los endpoints de lectura necesitamos una notificación preexistente.
// Como el repo vive en memoria, creamos una en el beforeAll del bloque.
describe('GET /notificaciones/no-leidas/:idUsuario', () => {
  const ID_USUARIO = 10;

  beforeAll(async () => {
    // Creamos una notificación para el usuario 10
    await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: 99,
      mensaje: 'Notificación de prueba',
    });
  });

  it('devuelve las notificaciones no leídas del usuario', async () => {
    const res = await request(app).get(`/notificaciones/no-leidas/${ID_USUARIO}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // Todas deben ser del usuario correcto y no leídas
    res.body.data.forEach((n) => {
      expect(n.destinatario).toBe(ID_USUARIO);
      expect(n.leida).toBe(false);
    });
  });

  it('devuelve array vacío si el usuario no tiene notificaciones no leídas', async () => {
    const res = await request(app).get('/notificaciones/no-leidas/999');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('falla si el id de usuario es inválido', async () => {
    const res = await request(app).get('/notificaciones/no-leidas/abc');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /notificaciones/:id (marcar como leída)', () => {
  const ID_USUARIO = 20;
  let idNotificacion;

  beforeAll(async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: 99,
      mensaje: 'Para marcar como leída',
    });
    idNotificacion = res.body.data.id;
  });

  it('marca la notificación como leída', async () => {
    const res = await request(app)
      .patch(`/notificaciones/${idNotificacion}`)
      .send({ idUsuario: ID_USUARIO });

    expect(res.status).toBe(200);
    expect(res.body.data.leida).toBe(true);
  });

  it('falla si el idUsuario no es el destinatario', async () => {
    // Creamos otra notificación
    const crearRes = await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: 99,
      mensaje: 'Otra',
    });
    const otroId = crearRes.body.data.id;

    // Intentamos marcarla con un usuario distinto
    const res = await request(app).patch(`/notificaciones/${otroId}`).send({ idUsuario: 9999 });

    // El service devuelve NotFoundError para no filtrar info
    expect(res.status).toBe(404);
  });

  it('falla si la notificación no existe', async () => {
    const res = await request(app).patch('/notificaciones/99999').send({ idUsuario: ID_USUARIO });

    expect(res.status).toBe(404);
  });
});

import request from 'supertest';
import app from '../../app.js';

// Supertest envuelve la app de Express y hace requests reales contra ella,
// sin necesidad de que el servidor esté escuchando en ningún puerto.
// Cada `request(app).post(...)` es equivalente a hacer un fetch contra el servidor real.

describe('POST /notificaciones', () => {
  it('crea una notificación con datos válidos', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: '507f1f77bcf86cd799439011',
      remitente: '507f1f77bcf86cd799439012',
      mensaje: 'Turno confirmado',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('created');
    expect(res.body.data).toMatchObject({
      destinatario: '507f1f77bcf86cd799439011',
      remitente: '507f1f77bcf86cd799439012',
      mensaje: 'Turno confirmado',
      leida: false,
    });
    expect(res.body.data._id || res.body.data.id).toBeDefined();
  });

  it('falla si falta el destinatario', async () => {
    const res = await request(app).post('/notificaciones').send({
      remitente: '507f1f77bcf86cd799439012',
      mensaje: 'Turno confirmado',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('falla si el mensaje está vacío', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: '507f1f77bcf86cd799439011',
      remitente: '507f1f77bcf86cd799439012',
      mensaje: '   ',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('falla si el id del destinatario es inválido (ej. mal formato Mongoose)', async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: 'id-invalido-123',
      remitente: '507f1f77bcf86cd799439012',
      mensaje: 'Hola',
    });

    // El ValidadorId ataja el formato inválido y lanza BadRequestError
    expect(res.status).toBe(400);
  });
});

// Para los endpoints de lectura necesitamos una notificación preexistente.
describe('GET /notificaciones/no-leidas/:idUsuario', () => {
  const ID_USUARIO = '507f1f77bcf86cd799439010';

  beforeAll(async () => {
    // Creamos una notificación para el usuario en la BD
    await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: '507f1f77bcf86cd799439099',
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
      expect(String(n.destinatario)).toBe(ID_USUARIO);
      expect(n.leida).toBe(false);
    });
  });

  it('devuelve array vacío si el usuario no tiene notificaciones no leídas', async () => {
    // Buscamos con un ID válido de Mongoose pero que no tiene registros
    const res = await request(app).get('/notificaciones/no-leidas/507f1f77bcf86cd799439088');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('falla si el id de usuario es inválido', async () => {
    const res = await request(app).get('/notificaciones/no-leidas/abc');

    expect(res.status).toBe(400);
  });
});

describe('PATCH /notificaciones/:id_notificacion/:id_destinatario (marcar como leída)', () => {
  const ID_USUARIO = '507f1f77bcf86cd799439020';
  let idNotificacion;

  beforeAll(async () => {
    const res = await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: '507f1f77bcf86cd799439099',
      mensaje: 'Para marcar como leída',
    });
    idNotificacion = res.body.data._id || res.body.data.id;
  });

  it('marca la notificación como leída', async () => {
    // Pegamos a la URL correcta usando parámetros de ruta
    const res = await request(app).patch(`/notificaciones/${idNotificacion}/${ID_USUARIO}`);

    expect(res.status).toBe(200);
    expect(res.body.data.leida).toBe(true);
  });

  it('falla si el idUsuario no es el destinatario', async () => {
    // Creamos otra notificación
    const crearRes = await request(app).post('/notificaciones').send({
      destinatario: ID_USUARIO,
      remitente: '507f1f77bcf86cd799439099',
      mensaje: 'Otra notificacion',
    });
    const otroId = crearRes.body.data._id || crearRes.body.data.id;

    // Intentamos marcarla con un usuario distinto (pero que sea un ObjectId válido)
    const idUsuarioFalso = '507f1f77bcf86cd799439099';
    const res = await request(app).patch(`/notificaciones/${otroId}/${idUsuarioFalso}`);

    // El service devuelve NotFoundError para no filtrar info
    expect(res.status).toBe(404);
  });

  it('falla si la notificación no existe', async () => {
    // ID válido pero inexistente
    const notificacionInexistente = '507f1f77bcf86cd799439099';
    const res = await request(app).patch(
      `/notificaciones/${notificacionInexistente}/${ID_USUARIO}`,
    );

    expect(res.status).toBe(404);
  });
});

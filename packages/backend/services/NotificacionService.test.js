import { jest } from '@jest/globals';
import { NotFoundError } from '../errors/AppError.js';
import { NotificacionService } from './NotificacionService.js';
import { Notificacion } from '../domain/notificacion/Notificacion.js';

const mockNotificacionRepository = {
  findAllReadByUserId: jest.fn(),
  findAllUnreadByUserId: jest.fn(),
  findById: jest.fn(),
  markAsRead: jest.fn(),
  save: jest.fn(),
};

const mockUsuarioRepository = {
  findById: jest.fn(),
};

const validObjectId = '507f1f77bcf86cd799439011';
const otherObjectId = '507f1f77bcf86cd799439012';

describe('NotificacionService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificacionService({
      notificacionRepository: mockNotificacionRepository,
      usuarioRepository: mockUsuarioRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('obtiene notificaciones leídas para un usuario válido', async () => {
    mockNotificacionRepository.findAllReadByUserId.mockResolvedValue([{ id: '1', leida: true }]);

    const result = await service.obtenerLeidas(validObjectId);

    expect(mockNotificacionRepository.findAllReadByUserId).toHaveBeenCalledWith(validObjectId);
    expect(result).toEqual([{ id: '1', leida: true }]);
  });

  it('obtiene notificaciones no leídas para un usuario válido', async () => {
    mockNotificacionRepository.findAllUnreadByUserId.mockResolvedValue([{ id: '2', leida: false }]);

    const result = await service.obtenerNoLeidas(validObjectId);

    expect(mockNotificacionRepository.findAllUnreadByUserId).toHaveBeenCalledWith(validObjectId);
    expect(result).toEqual([{ id: '2', leida: false }]);
  });

  it('marca una notificación como leída cuando el destinatario coincide (vía id directo)', async () => {
    mockNotificacionRepository.findById.mockResolvedValue({
      id: validObjectId,
      destinatario: validObjectId,
      populated: jest.fn(() => null), // Camino: no viene populado
    });
    mockNotificacionRepository.markAsRead.mockResolvedValue({ id: validObjectId, leida: true });

    const result = await service.marcarComoLeida(validObjectId, validObjectId);

    expect(mockNotificacionRepository.findById).toHaveBeenCalledWith(validObjectId);
    expect(mockNotificacionRepository.markAsRead).toHaveBeenCalledWith(validObjectId);
    expect(result).toEqual({ id: validObjectId, leida: true });
  });

  it('marca una notificación como leída cuando el destinatario coincide (vía populated de Mongoose)', async () => {
    mockNotificacionRepository.findById.mockResolvedValue({
      id: validObjectId,
      destinatario: { _id: validObjectId, nombreUsuario: 'paciente-test' },
      populated: jest.fn(() => validObjectId), // Devuelve el ID subyacente del populado
    });
    mockNotificacionRepository.markAsRead.mockResolvedValue({ id: validObjectId, leida: true });

    const result = await service.marcarComoLeida(validObjectId, validObjectId);

    expect(mockNotificacionRepository.markAsRead).toHaveBeenCalledWith(validObjectId);
    expect(result).toEqual({ id: validObjectId, leida: true });
  });

  it('lanza NotFoundError si la notificación no existe', async () => {
    mockNotificacionRepository.findById.mockResolvedValue(null);

    await expect(service.marcarComoLeida(validObjectId, validObjectId)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('lanza NotFoundError si la notificación pertenece a otro usuario', async () => {
    mockNotificacionRepository.findById.mockResolvedValue({
      id: otherObjectId,
      destinatario: otherObjectId,
      populated: jest.fn(() => null),
    });

    await expect(service.marcarComoLeida(otherObjectId, validObjectId)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('guarda una nueva notificación correctamente e instancia la clase de Dominio', async () => {
    const datosNotificacion = {
      destinatario: validObjectId,
      remitente: validObjectId,
      mensaje: 'Hola',
    };

    mockNotificacionRepository.save.mockImplementation((instancia) => {
      return Promise.resolve({ id: '5', ...instancia });
    });

    const result = await service.save(datosNotificacion);

    // Verificaciones críticas de arquitectura de capas
    expect(mockNotificacionRepository.save).toHaveBeenCalled();
    expect(result.destinatario).toBe(validObjectId);
    expect(result.mensaje).toBe('Hola');
    expect(result.leida).toBe(false);
  });

  it('lanza un error si se le pasa un ID inválido a obtenerLeidas', async () => {
    await expect(service.obtenerLeidas('id-invalido-123')).rejects.toThrow();
  });
});

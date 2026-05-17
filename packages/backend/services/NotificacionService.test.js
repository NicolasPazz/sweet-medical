import { jest } from '@jest/globals';
import { NotFoundError } from '../errors/AppError.js';
import { NotificacionService } from './NotificacionService.js';

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

  it('marca una notificación como leída cuando el destinatario coincide', async () => {
    mockNotificacionRepository.findById.mockResolvedValue({
      id: validObjectId,
      destinatario: validObjectId,
      populated: jest.fn(() => null),
    });
    mockNotificacionRepository.markAsRead.mockResolvedValue({ id: validObjectId, leida: true });

    const result = await service.marcarComoLeida(validObjectId, validObjectId);

    expect(mockNotificacionRepository.findById).toHaveBeenCalledWith(validObjectId);
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

  it('guarda una nueva notificación correctamente', async () => {
    const datosNotificacion = {
      destinatario: validObjectId,
      remitente: validObjectId,
      mensaje: 'Hola',
    };
    mockNotificacionRepository.save.mockResolvedValue({ id: '5', ...datosNotificacion });

    const result = await service.save(datosNotificacion);

    expect(mockNotificacionRepository.save).toHaveBeenCalled();
    expect(result).toEqual({ id: '5', ...datosNotificacion });
  });
});

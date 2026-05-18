import { jest } from '@jest/globals';
import { ServicioService } from './ServicioService.js';
import { Usuario } from '../domain/usuario/Usuario.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/AppError.js';

const mockServicioRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockUsuarioRepository = {
  findById: jest.fn(),
};

describe('ServicioService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ServicioService({
      servicioRepository: mockServicioRepository,
      usuarioRepository: mockUsuarioRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('verificar que el usuario sistema sea el único autorizado', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });

    await expect(
      service.verificarUsuarioSistema('507f1f77bcf86cd799439011'),
    ).resolves.toBeUndefined();
  });

  it('lanza NotFoundError si el usuario no existe en verificarUsuarioSistema', async () => {
    mockUsuarioRepository.findById.mockResolvedValue(null);

    await expect(service.verificarUsuarioSistema('507f1f77bcf86cd799439011')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('lanza ForbiddenError si el usuario no es Sistema', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({ nombreUsuario: 'otro' });

    await expect(service.verificarUsuarioSistema('507f1f77bcf86cd799439011')).rejects.toThrow(
      ForbiddenError,
    );
  });

  it('obtiene todos los servicios existentes', async () => {
    const servicios = [{ id: 's-1' }, { id: 's-2' }];
    mockServicioRepository.findAll.mockResolvedValue(servicios);

    const resultado = await service.obtenerTodos();

    expect(resultado).toEqual(servicios);
  });

  it('obtiene un servicio por id existente', async () => {
    const id = '507f1f77bcf86cd799439011';
    const servicio = { id };
    mockServicioRepository.findById.mockResolvedValue(servicio);

    const resultado = await service.obtenerPorId(id);

    expect(resultado).toEqual(servicio);
    expect(mockServicioRepository.findById).toHaveBeenCalledWith(id);
  });

  it('lanza NotFoundError al obtener un servicio inexistente', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockServicioRepository.findById.mockResolvedValue(null);

    await expect(service.obtenerPorId(id)).rejects.toThrow(NotFoundError);
  });

  it('lanza error si el ID provisto a obtenerPorId es inválido según ValidadorId', async () => {
    // Verifica que la capa interceptora de ID funcione correctamente ante strings corruptos
    await expect(service.obtenerPorId('id-invalido')).rejects.toThrow();
  });

  it('agrega una práctica nueva cuando datos incluyen código', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.save.mockResolvedValue({
      id: 's-1',
      codigo: 'P-01',
      nombre: 'Práctica',
    });

    const resultado = await service.agregar('507f1f77bcf86cd799439011', {
      codigo: 'P-01',
      nombre: 'Práctica',
      duracionTurnoEnMins: 30,
      costo: 1000,
    });

    expect(resultado).toEqual({ id: 's-1', codigo: 'P-01', nombre: 'Práctica' });
    expect(mockServicioRepository.save).toHaveBeenCalled();
  });

  it('instancia correctamente la clase Practica al agregar con código', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    // Forzamos al mock a retornar la misma instancia de dominio recibida para evaluar su tipo
    mockServicioRepository.save.mockImplementation((obj) => Promise.resolve(obj));

    const resultado = await service.agregar('507f1f77bcf86cd799439011', {
      codigo: 'P-01',
      nombre: 'Radiografía',
      duracionTurnoEnMins: 20,
      costo: 1500,
    });

    expect(resultado.constructor.name).toBe('Practica');
    expect(resultado.codigo).toBe('P-01');
  });

  it('agrega una especialidad cuando no tiene código', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.save.mockResolvedValue({ id: 's-2', nombre: 'Especialidad' });

    const resultado = await service.agregar('507f1f77bcf86cd799439011', {
      nombre: 'Especialidad',
      duracionTurnoEnMins: 45,
      costo: 2000,
    });

    expect(resultado).toEqual({ id: 's-2', nombre: 'Especialidad' });
    expect(mockServicioRepository.save).toHaveBeenCalled();
  });

  it('instancia correctamente la clase Especialidad al agregar sin código', async () => {
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.save.mockImplementation((obj) => Promise.resolve(obj));

    const resultado = await service.agregar('507f1f77bcf86cd799439011', {
      nombre: 'Nutrición',
      duracionTurnoEnMins: 30,
      costo: 1200,
    });

    expect(resultado.constructor.name).toBe('Especialidad');
    expect(resultado.codigo).toBeUndefined();
  });


  it('lanza NotFoundError al modificar un servicio inexistente', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue(null);

    await expect(service.modificar('507f1f77bcf86cd799439011', id, {})).rejects.toThrow(
      NotFoundError,
    );
  });

  it('lanza BadRequestError si intenta asignar código a una especialidad', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue({
      id,
      nombre: 'Especialidad',
      codigo: undefined,
    });

    await expect(
      service.modificar('507f1f77bcf86cd799439011', id, { codigo: 'NEW' }),
    ).rejects.toThrow(BadRequestError);
  });

  it('modifica una Especialidad existente exitosamente', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue({
      id,
      nombre: 'Especialidad',
      codigo: undefined,
    });
    mockServicioRepository.update.mockResolvedValue({ id, nombre: 'Especialidad modificada' });

    const resultado = await service.modificar('507f1f77bcf86cd799439011', id, {
      nombre: 'Especialidad modificada',
    });

    expect(resultado).toEqual({ id, nombre: 'Especialidad modificada' });
    expect(mockServicioRepository.update).toHaveBeenCalledWith(id, {
      nombre: 'Especialidad modificada',
    });
  });

  it('modifica una Práctica existente exitosamente manteniendo su estructura', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue({
      id,
      nombre: 'Ecografía Vieja',
      codigo: 'ECO-01',
    });
    mockServicioRepository.update.mockResolvedValue({ id, nombre: 'Ecografía Nueva', codigo: 'ECO-01' });

    const resultado = await service.modificar('507f1f77bcf86cd799439011', id, {
      nombre: 'Ecografía Nueva',
    });

    expect(resultado.nombre).toBe('Ecografía Nueva');
    expect(mockServicioRepository.update).toHaveBeenCalledWith(id, { nombre: 'Ecografía Nueva' });
  });


  it('elimina un servicio existente correctamente', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue({ id });
    mockServicioRepository.delete.mockResolvedValue({ deleted: true });

    const resultado = await service.eliminar('507f1f77bcf86cd799439011', id);

    expect(resultado).toEqual({ deleted: true });
    expect(mockServicioRepository.delete).toHaveBeenCalledWith(id);
  });

  it('lanza NotFoundError al eliminar un servicio inexistente', async () => {
    const id = '507f1f77bcf86cd799439011';
    mockUsuarioRepository.findById.mockResolvedValue({
      nombreUsuario: Usuario.USUARIO_SISTEMA.nombreUsuario,
    });
    mockServicioRepository.findById.mockResolvedValue(null);

    await expect(service.eliminar('507f1f77bcf86cd799439011', id)).rejects.toThrow(NotFoundError);
  });
});
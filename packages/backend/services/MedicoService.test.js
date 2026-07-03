import { jest } from '@jest/globals';
import { MedicoService } from './MedicoService.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';

const mockMedicoRepository = {
  findById: jest.fn(),
  findByMatricula: jest.fn(),
  save: jest.fn(),
  crear: jest.fn(),
};

const mockUsuarioRepository = {
  save: jest.fn(),
};

describe('MedicoService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MedicoService({
      medicoRepository: mockMedicoRepository,
      usuarioRepository: mockUsuarioRepository,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  xit('actualiza disponibilidad con mayúsculas y espera el guardado del médico (await)', async () => {
    const medicoExistente = { id: 'm-1', disponibilidades: [] };
    mockMedicoRepository.findById.mockResolvedValue(medicoExistente);
    // Aseguramos que resuelva la promesa correctamente para el await
    mockMedicoRepository.save.mockResolvedValue(true);

    const resultado = await service.actualizarDisponibilidad('m-1', [
      { diaSemana: ' lunes ', horaInicio: '09:00', horaFin: '12:00' },
    ]);

    expect(mockMedicoRepository.findById).toHaveBeenCalledWith('m-1');
    expect(mockMedicoRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        disponibilidades: [{ diaSemana: 'LUNES', horaInicio: '09:00', horaFin: '12:00' }],
      }),
    );
    expect(resultado.disponibilidades[0].diaSemana).toBe('LUNES');
  });

  xit('lanza NotFoundError cuando no existe el médico al actualizar disponibilidad', async () => {
    mockMedicoRepository.findById.mockResolvedValue(null);

    await expect(service.actualizarDisponibilidad('m-1', [])).rejects.toThrow(NotFoundError);
  });

  xit('crea un médico nuevo con usuario si no existe matrícula duplicada', async () => {
    const datos = {
      usuario: { nombreUsuario: 'drhouse', contrasena: '1234', email: 'house@example.com' },
      matricula: '1234',
      nombre: 'Dr. House',
      especialidades: ['s-cardio'],
      practicas: ['p-rx'],
      sedes: ['sede-central'],
    };

    mockMedicoRepository.findByMatricula.mockResolvedValue(null);
    mockUsuarioRepository.save.mockResolvedValue({ _id: 'u-1' });
    mockMedicoRepository.crear.mockResolvedValue({
      id: 'm-1',
      usuario: 'u-1',
      matricula: '1234',
      nombre: 'Dr. House',
    });

    const resultado = await service.crearMedico(datos);

    expect(mockMedicoRepository.findByMatricula).toHaveBeenCalledWith('1234');
    expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombreUsuario: 'drhouse',
        email: 'house@example.com',
        roles: ['MEDICO'],
      }),
    );
    expect(mockMedicoRepository.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario: 'u-1',
        matricula: '1234',
        nombre: 'Dr. House',
        especialidades: ['s-cardio'],
      }),
    );
    expect(resultado).toEqual({
      id: 'm-1',
      usuario: 'u-1',
      matricula: '1234',
      nombre: 'Dr. House',
    });
  });

  xit('asigna arrays vacíos por defecto si no se envían colecciones opcionales al crear', async () => {
    // TEST NUEVO: Evalúa el cortocircuito (|| []) del código de producción
    const datosMinimos = {
      usuario: { nombreUsuario: 'doctor-min', contrasena: 'root', email: 'min@test.com' },
      matricula: '9999',
      nombre: 'Dr. Mínimo',
      // Omitimos especialidades, practicas y sedes de forma intencional
    };

    mockMedicoRepository.findByMatricula.mockResolvedValue(null);
    mockUsuarioRepository.save.mockResolvedValue({ _id: 'u-2' });
    mockMedicoRepository.crear.mockImplementation((medicoRecibido) =>
      Promise.resolve(medicoRecibido),
    );

    const resultado = await service.crearMedico(datosMinimos);

    // Verificamos que la lógica de inicialización defensiva haya operado bien
    expect(resultado.especialidades).toEqual([]);
    expect(resultado.practicas).toEqual([]);
    expect(resultado.sedes).toEqual([]);
    expect(resultado.disponibilidades).toEqual([]);
  });

  it('lanza ConflictError si la matrícula ya existe al crear médico', async () => {
    mockMedicoRepository.findByMatricula.mockResolvedValue({ id: 'm-1' });

    await expect(
      service.crearMedico({ usuario: { nombreUsuario: 'x' }, matricula: '1234', nombre: 'Dr.' }),
    ).rejects.toThrow(ConflictError);
  });

  it('lanza un error si faltan datos obligatorios al crear médico', async () => {
    await expect(service.crearMedico({ matricula: '1234' })).rejects.toThrow(
      'Faltan datos obligatorios para crear el médico',
    );
  });
});

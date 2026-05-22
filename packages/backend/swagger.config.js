import swaggerJsdoc from 'swagger-jsdoc';
import { getPort, getPublicBaseUrl } from './utils/serverConfig.js';

const port = getPort();
const publicBaseUrl = getPublicBaseUrl(port);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sweet Medical API',
      version: '1.0.0',
      description:
        'API de gestión de turnos médicos, pacientes y servicios de salud. Sweet Medical es una plataforma integral para reserva y gestión de citas médicas.',
      contact: {
        name: 'Sweet Medical Support',
        email: 'support@sweetmedical.com',
      },
    },
    servers: [
      {
        url: publicBaseUrl,
        description:
          process.env.NODE_ENV === 'production' ? 'Production Server' : 'Configured Server',
      },
    ],
    components: {
      schemas: {
        Especialidad: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID de la especialidad (MongoDB ObjectId)',
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la especialidad',
            },
            duracionTurnoEnMins: {
              type: 'integer',
              description: 'Duración del turno en minutos',
            },
            costo: {
              type: 'integer',
              description: 'Costo de la consulta',
            },
          },
        },
        Practica: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID de la práctica (MongoDB ObjectId)',
            },
            codigo: {
              type: 'string',
              description: 'Código de la práctica',
            },
            nombre: {
              type: 'string',
              description: 'Nombre de la práctica',
            },
            duracionTurnoEnMins: {
              type: 'integer',
              description: 'Duración del turno en minutos',
            },
            costo: {
              type: 'integer',
              description: 'Costo de la práctica',
            },
          },
        },
        Disponibilidad: {
          type: 'object',
          properties: {
            diaSemana: {
              type: 'string',
              enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
              description: 'Día de la semana',
            },
            horaDesde: {
              type: 'string',
              pattern: '^\\d{2}:\\d{2}$',
              example: '08:00',
              description: 'Hora de inicio (HH:mm)',
            },
            horaHasta: {
              type: 'string',
              pattern: '^\\d{2}:\\d{2}$',
              example: '12:00',
              description: 'Hora de fin (HH:mm)',
            },
          },
        },
        TurnoMedicoDetail: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID del turno',
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del turno',
            },
            medico: {
              type: 'string',
              description: 'Nombre del médico',
            },
            servicio: {
              type: 'object',
              properties: {
                nombre: {
                  type: 'string',
                },
                codigo: {
                  type: 'string',
                  nullable: true,
                },
              },
            },
            sede: {
              type: 'string',
              description: 'Nombre de la sede',
            },
            estado: {
              type: 'string',
              description: 'Estado del turno',
            },
            costoPaciente: {
              type: 'integer',
              description: 'Costo para el paciente',
            },
            horario: {
              type: 'string',
              description: 'Hora del turno',
            },
            diaSemana: {
              type: 'string',
              description: 'Día de la semana',
            },
          },
        },
        Medico: {
          type: 'object',
          properties: {
            id_usuario: {
              type: 'string',
              description: 'ID único del usuario médico',
            },
            id_medico: {
              type: 'string',
              description: 'ID único del médico',
            },
            nombre: {
              type: 'string',
              description: 'Nombre del médico',
            },
            especialidades: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Especialidad',
              },
              description: 'Lista de especialidades del médico',
            },
            practicas: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Practica',
              },
              description: 'Lista de prácticas que realiza el médico',
            },
            disponibilidades: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Disponibilidad',
              },
              description: 'Horarios disponibles del médico',
            },
            turnos: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TurnoMedicoDetail',
              },
              description: 'Turnos actuales y futuros del médico',
            },
          },
        },
        Paciente: {
          type: 'object',
          properties: {
            id_usuario: {
              type: 'string',
              description: 'ID único del usuario paciente',
            },
            id_paciente: {
              type: 'string',
              description: 'ID único del paciente',
            },
            nombre: {
              type: 'string',
              description: 'Nombre del paciente',
            },
            dni: {
              type: 'string',
              description: 'Documento Nacional de Identidad',
            },
            obraSocial: {
              type: 'string',
              description: 'Obra social del paciente',
            },
            plan: {
              type: 'string',
              description: 'Plan de cobertura',
            },
          },
        },
        HistorialEstadoTurno: {
          type: 'object',
          properties: {
            fechaHoraCambio: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del cambio de estado',
            },
            estado: {
              type: 'string',
              description: 'Estado del turno',
            },
            motivo: {
              type: 'string',
              description: 'Motivo del cambio de estado',
            },
            actor: {
              type: 'string',
              description: 'Actor que realizó el cambio (ADMIN, MEDICO, PACIENTE)',
            },
          },
        },
        Turno: {
          type: 'object',
          properties: {
            id_turno: {
              type: 'string',
              description: 'ID único del turno',
            },
            id_medico: {
              type: 'string',
              description: 'ID del médico',
            },
            id_paciente: {
              type: 'string',
              description: 'ID del paciente (N/A si está disponible)',
            },
            fechaHora: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del turno',
            },
            sede: {
              type: 'string',
              description: 'Nombre de la sede',
            },
            servicio: {
              type: 'string',
              description: 'Nombre del servicio/especialidad',
            },
            estado: {
              type: 'string',
              enum: ['DISPONIBLE', 'RESERVADO', 'CONFIRMADO', 'REALIZADO', 'CANCELADO'],
              description: 'Estado del turno',
            },
            historialEstados: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/HistorialEstadoTurno',
              },
              description: 'Historial de cambios de estado',
            },
            costo: {
              type: 'integer',
              description: 'Costo del turno',
            },
            diaSemana: {
              type: 'string',
              description: 'Día de la semana',
            },
            hora: {
              type: 'string',
              pattern: '^\\d{2}:\\d{2}$',
              description: 'Hora del turno (HH:mm)',
            },
          },
        },
        Servicio: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del servicio (MongoDB ObjectId)',
            },
            nombre: {
              type: 'string',
              description: 'Nombre del servicio/especialidad',
            },
            duracionTurnoEnMins: {
              type: 'integer',
              description: 'Duración del turno en minutos',
            },
            costo: {
              type: 'integer',
              description: 'Costo del servicio',
            },
          },
        },
        Notificacion: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único de la notificación',
            },
            destinatario: {
              type: 'string',
              description: 'ID del usuario destinatario',
            },
            remitente: {
              type: 'string',
              description: 'ID del usuario remitente',
            },
            mensaje: {
              type: 'string',
              description: 'Contenido del mensaje',
            },
            leida: {
              type: 'boolean',
              description: 'Estado de lectura de la notificación',
            },
            fechaCreacion: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success', 'created', 'fail'],
              description: 'Estado de la respuesta',
            },
            data: {
              description: 'Datos de la respuesta',
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['fail'],
              description: 'Estado de error',
            },
            message: {
              type: 'string',
              description: 'Mensaje de error',
            },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Médicos',
        description: 'Operaciones relacionadas con médicos',
      },
      {
        name: 'Pacientes',
        description: 'Operaciones relacionadas con pacientes',
      },
      {
        name: 'Turnos',
        description: 'Operaciones de reserva y gestión de turnos',
      },
      {
        name: 'Servicios',
        description: 'Gestión de servicios y especialidades',
      },
      {
        name: 'Notificaciones',
        description: 'Operaciones de notificaciones',
      },
      {
        name: 'Seeding',
        description: 'Carga de datos iniciales',
      },
      {
        name: 'Utilidades',
        description: 'Endpoints de utilidad',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

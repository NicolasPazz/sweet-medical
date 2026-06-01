export const ID_USUARIO_SISTEMA = '000000000000000000000001';
export const ID_MEDICO_GOMEZ    = '6a09dd781c91c496abde71f3';
export const ID_MEDICO_LOPEZ    = '6a09dd781c91c496abde71f4';
export const ID_YO              = '6a09dd781c91c496abde71c8';


export const notificacionesMock = [
  {
    _id: '6a09dd781c91c496abde7200',
    destinatario: ID_YO,
    remitente: ID_MEDICO_GOMEZ,
    mensaje: 'Hola, tu turno con el Dr. Gómez para Cardiología ha sido confirmado para el 05/06/2026.',
    fechaHoraCreacion: new Date(Date.now() - 5 * 60 * 1000),   // hace 5 min
    fechaHoraLeida: null,
    leida: false,
  },
  {
    _id: '6a09dd781c91c496abde7201',
    destinatario: ID_YO,
    remitente: ID_USUARIO_SISTEMA,
    mensaje: 'Recordatorio: Mañana es tu turno con el Dr. Martínez.',
    fechaHoraCreacion: new Date(Date.now() - 60 * 60 * 1000),  // hace 1 hora
    fechaHoraLeida: null,
    leida: false,
  },
  {
    _id: '6a09dd781c91c496abde7202',
    destinatario: ID_YO,
    remitente: ID_MEDICO_LOPEZ,
    mensaje: 'El profesional ha cancelado tu turno del 03/06/2026 en la sede Centro para Dermatología.',
    fechaHoraCreacion: new Date(Date.now() - 3 * 60 * 60 * 1000), // hace 3 horas
    fechaHoraLeida: null,
    leida: false,
  },
  {
    _id: '6a09dd781c91c496abde7203',
    destinatario: ID_YO,
    remitente: ID_USUARIO_SISTEMA,
    mensaje: 'El médico ha solicitado reprogramar el turno para el 10/06/2026.',
    fechaHoraCreacion: new Date(Date.now() - 24 * 60 * 60 * 1000), // ayer
    fechaHoraLeida: null,
    leida: false,
  },
];
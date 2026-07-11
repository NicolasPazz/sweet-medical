// mockdata/servicios.js
// Datos hardcodeados para usar en la Entrega 3 (sin conexión al back).
// Refleja la separación real del backend: /especialidades y /practicas son
// endpoints distintos, con shapes distintos (Practica tiene `codigo`).
// En la Entrega 4 esto se reemplaza por llamadas reales a cada endpoint.

export const especialidadesMock = [
  { id: 'esp-001', nombre: 'Cardiología', duracionTurnoEnMins: 30, costo: 8500 },
  { id: 'esp-002', nombre: 'Dermatología', duracionTurnoEnMins: 20, costo: 7000 },
  { id: 'esp-003', nombre: 'Clínica Médica', duracionTurnoEnMins: 30, costo: 6000 },
  { id: 'esp-004', nombre: 'Neurología', duracionTurnoEnMins: 40, costo: 9500 },
  { id: 'esp-005', nombre: 'Pediatría', duracionTurnoEnMins: 25, costo: 6500 },
  { id: 'esp-006', nombre: 'Traumatología', duracionTurnoEnMins: 30, costo: 8000 },
];

export const practicasMock = [
  {
    id: 'pra-001',
    codigo: 'ECG-001',
    nombre: 'Electrocardiograma',
    duracionTurnoEnMins: 15,
    costo: 4500,
  },
  {
    id: 'pra-002',
    codigo: 'RXT-001',
    nombre: 'Radiografía de Tórax',
    duracionTurnoEnMins: 10,
    costo: 5000,
  },
  {
    id: 'pra-003',
    codigo: 'LAB-001',
    nombre: 'Extracción de Sangre',
    duracionTurnoEnMins: 10,
    costo: 2500,
  },
  {
    id: 'pra-004',
    codigo: 'ECO-001',
    nombre: 'Ecografía Abdominal',
    duracionTurnoEnMins: 20,
    costo: 7500,
  },
  {
    id: 'pra-005',
    codigo: 'ESP-001',
    nombre: 'Espirometría',
    duracionTurnoEnMins: 20,
    costo: 5500,
  },
];

// Genera IDs temporales para registros creados en memoria durante la sesión
let _nextEspId = 100;
let _nextPraId = 100;
export function generarIdEspecialidad() {
  return `esp-${String(_nextEspId++).padStart(3, '0')}`;
}
export function generarIdPractica() {
  return `pra-${String(_nextPraId++).padStart(3, '0')}`;
}

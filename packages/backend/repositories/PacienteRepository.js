
export class PacienteRepository {
  constructor() {
    this.pacientes = {};
    this.nextId = 1;
  }

  async save(paciente) {
    console.log("Cargando paciente de nombre: " + paciente.nombre);
    const id = this.nextId++;
    paciente.id = id;
    this.pacientes[id] = paciente;

    console.log("paciente cargado de nombre: " + this.pacientes[id].nombre);
    return paciente;
  }

  async findById(id) {
    return this.pacientes[id];
  }

  async modificar(id, datosActualizados) {
    const paciente = await this.obtenerPorId(id);
    if (paciente) {
      Object.assign(paciente, datosActualizados);
    }
    return paciente;
  }

  async findAll() {
    return Object.values(this.pacientes);
  }

  async eliminar(id) {
    if (this.pacientes[id]) {
      delete this.pacientes[id];
      return true;
    }
    return false;
  }
}

export const pacienteRepository = new PacienteRepository();
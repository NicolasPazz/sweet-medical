
export class MedicoRepository {
  constructor() {
    this.medicos = {};
    this.nextId = 1;
  }

  async save(medico) {
    console.log("Cargando medico de nombre: " + medico.nombre);
    const id = this.nextId++;
    medico.id = id;
    this.medicos[id] = medico;

    console.log("Medico cargado de nombre: " + this.medicos[id].nombre);
    return medico;
  }

  async findById(id) {
    return this.medicos[id];
  }

  async modificar(id, datosActualizados) {
    const medico = await this.obtenerPorId(id);
    if (medico) {
      Object.assign(medico, datosActualizados);
    }
    return medico;
  }

  async findAll() {
    return Object.values(this.medicos);
  }

  async eliminar(id) {
    if (this.medicos[id]) {
      delete this.medicos[id];
      return true;
    }
    return false;
  }
}

export const medicoRepository = new MedicoRepository();
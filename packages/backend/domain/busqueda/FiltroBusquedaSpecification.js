export class FiltroBusquedaSpecification {
  constructor({ profesionalId, especialidad, practica, sede, fechaDesde, fechaHasta }) {
    this.profesionalId = profesionalId;
    this.especialidad = especialidad;
    this.practica = practica;
    this.sede = sede;
    this.fechaDesde = fechaDesde;
    this.fechaHasta = fechaHasta;
  }

  /**
   * Genera el objeto criteria/query que un ORM como Mongoose puede usar directamente.
   */
  toCriteria() {
    return {
      profesionalId: this.profesionalId,
      especialidad: this.especialidad,
      practica: this.practica,
      sede: this.sede,
      fechaDesde: this.fechaDesde,
      fechaHasta: this.fechaHasta
    };
  }
}

export class DisponibilidadHoraria {
  id;
  diaSemana;
  horaDesde;
  horaHasta;

  constructor(diaSemana, horaDesde, horaHasta) {
    this.diaSemana = diaSemana;
    this.horaDesde = horaDesde;
    this.horaHasta = horaHasta;
  }
}

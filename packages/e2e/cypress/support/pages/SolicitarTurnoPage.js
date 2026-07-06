class SolicitarTurnoPage {
  constructor(cy) {
    this.cy = cy;
  }

  expectPageVisible() {
    this.cy.get('.paciente-select-dropdown').should('be.visible');
    return this;
  }

  selectPacienteByIndex(index) {
    this.cy
      .get('.paciente-select-dropdown')
      .should('be.visible')
      .find('option')
      .should('have.length.greaterThan', index);
    this.cy.get('.paciente-select-dropdown').select(index);
    this.cy.get('.paciente-selected-info').should('be.visible');
    return this;
  }

  selectFirstService() {
    this.cy.get('.service-card').first().should('be.visible').click();
    return this;
  }

  goToMedicoStep() {
    this.cy
      .contains('button', /Continuar con/i)
      .should('be.visible')
      .click();
    return this;
  }

  goToDisponibilidad() {
    this.cy
      .contains('button', /Ver Disponibilidad/i)
      .should('be.visible')
      .click();
    return this;
  }

  selectFirstAvailableDay() {
    this.cy.get('.cal-day.has-slots').first().should('be.visible').click();
    return this;
  }

  selectFirstSlot() {
    this.cy.get('.slot-btn').first().should('be.visible').click();
    return this;
  }

  expectSlotAlert() {
    this.cy.get('.slot-alert-info').should('be.visible');
    return this;
  }

  addTurnAndReturnToSearch() {
    this.cy
      .contains('button', /Sumar turno/i)
      .should('be.visible')
      .click();
    return this;
  }

  expectCartCount(value) {
    this.cy.get('.cart-count').should('be.visible').and('have.text', value);
    return this;
  }

  openCartDropdown() {
    this.cy.get('button[aria-label="Ver carrito"]').should('be.visible').click();
    this.cy.get('.cart-dropdown').should('be.visible');
    return this;
  }

  removeFirstCartItem() {
    this.cy
      .get('.cart-dropdown')
      .find('button[title="Quitar del carrito"]')
      .first()
      .should('be.visible')
      .click();
    return this;
  }

  expectCartEmpty() {
    this.cy.contains(/No tenés turnos en el carrito/i).should('be.visible');
    this.cy.get('.cart-count').should('not.exist');
    return this;
  }
}

module.exports = SolicitarTurnoPage;

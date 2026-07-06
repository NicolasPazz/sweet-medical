class SolicitarTurnoPage {
  url = '/solicitar-turno';

  goto() {
    cy.visit(this.url);
    return this;
  }

  expectPageVisible() {
    cy.url().should('include', this.url).and('not.include', '/401').and('not.include', '/403');
    cy.intercept('GET', '**/turnos**').as('getTurnos');
    cy.get('.services-grid').should('be.visible');
    cy
      .get('.service-card')
      .should('have.length.greaterThan', 0)
      .first()
      .should('be.visible')
      .click();
    return this;
  }

  selectFirstService() {
    cy.wait('@getTurnos');
    cy
      .get('.service-card')
      .first()
      .should('be.visible')
      .click();

    cy
      .get('.service-card')
      .first()
      .should('have.class', 'selected');
    return this;

  }

  goToMedicoStep() {
    cy
      .contains('button', /Continuar con/i)
      .should('be.visible')
      .and('be.enabled')
      .click();
    return this;
  }

  goToDisponibilidad() {
    cy
      .contains('button', /Ver Disponibilidad/i)
      .should('be.visible')
      .click();
    return this;
  }

  selectFirstAvailableDay() {
    cy.get('.cal-day.has-slots').first().should('be.visible').click();
    return this;
  }

  selectFirstSlot() {
    cy.get('.slot-btn').first().should('be.visible').click();
    return this;
  }

  expectSlotAlert() {
    cy.get('.slot-alert-info').should('be.visible');
    return this;
  }

  addTurnAndReturnToSearch() {
    cy
      .contains('button', /Sumar turno/i)
      .should('be.visible')
      .click();
    return this;
  }

  expectCartCount(value) {
    cy.get('.cart-count').should('be.visible').and('have.text', value);
    return this;
  }

  openCartDropdown() {
    cy.get('button[aria-label="Ver carrito"]').should('be.visible').click();
    cy.get('.cart-dropdown').should('be.visible');
    return this;
  }

  removeFirstCartItem() {
    cy
      .get('.cart-dropdown')
      .find('button[title="Quitar del carrito"]')
      .first()
      .should('be.visible')
      .click();
    return this;
  }

  expectCartEmpty() {
    cy.contains(/No tenés turnos en el carrito/i).should('be.visible');
    cy.get('.cart-count').should('not.exist');
    return this;
  }
}

export default new SolicitarTurnoPage();
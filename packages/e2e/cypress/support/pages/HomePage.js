class HomePage {
  url = '/';

  goto() {
    cy.visit(this.url);
    return this;
  }

  expectLoggedIn() {
    cy.reload();
    cy.contains('a[href="/perfil"]', /Mi Perfil/i).should('be.visible');
    return this;
  }

  goToAgendarTurno() {
    cy.get('a[href="/solicitar-turno"]').first().should('be.visible').click();
    return this;
  }
}

export default new HomePage();

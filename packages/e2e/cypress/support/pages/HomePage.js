// Ruta: packages/e2e/cypress/support/pages/HomePage.js
class HomePage {
  constructor(cy) {
    this.cy = cy;
  }

  expectLoggedIn() {
    this.cy.contains('h1, h2, h3', /Bienvenido a Sweet Medical/i).should('be.visible');
    return this;
  }

  goToAgendarTurno() {
    this.cy.get('a[href="/solicitar-turno"]').first().should('be.visible').click();
    return this;
  }
}

module.exports = HomePage;

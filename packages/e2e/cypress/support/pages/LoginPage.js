class LoginPage {
  constructor(cy) {
    this.cy = cy;
  }

  goto() {
    this.cy.visit('/login');
    return this;
  }

  login(email, password) {
    this.cy
      .get('input[placeholder="Tu correo electrónico"]')
      .should('be.visible')
      .clear()
      .type(email);
    this.cy.get('input[placeholder="Tu contraseña"]').should('be.visible').clear().type(password);
    this.cy
      .contains('button', /Iniciar sesión/i)
      .should('be.visible')
      .click();
    return this;
  }
}

module.exports = LoginPage;

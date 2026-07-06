class LoginPage {
  url = '/login';

  goto() {
    cy.visit(this.url);
    return this;
  }

  login(email, password) {
    cy
      .get('input[placeholder="Tu correo electrónico"]')
      .should('be.visible')
      .clear()
      .type(email);
    cy
      .get('input[placeholder="Tu contraseña"]')
      .should('be.visible')
      .clear()
      .type(password);
    cy
      .contains('button', /Iniciar sesión/i)
      .should('be.visible')
      .click();
    cy.url().should('not.include', '/login');
    return this;
  }
}

export default new LoginPage();
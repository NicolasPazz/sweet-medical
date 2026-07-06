const LoginPage = require('../support/pages/LoginPage');
const HomePage = require('../support/pages/HomePage');
const SolicitarTurnoPage = require('../support/pages/SolicitarTurnoPage');

describe('Preselección de Turno y Carrito', () => {
  it('Paciente busca, preselecciona y elimina un turno', () => {
    const email = Cypress.env('E2E_USER_EMAIL');
    const password = Cypress.env('E2E_USER_PASSWORD');

    const loginPage = new LoginPage(cy);
    const homePage = new HomePage(cy);
    const solicitarTurnoPage = new SolicitarTurnoPage(cy);

    cy.session(
      [email, password],
      () => {
        loginPage.goto();
        loginPage.login(email, password);
        cy.location('pathname', { timeout: 10000 }).should('not.eq', '/login');
      },
      { cacheAcrossSpecs: true },
    );

    cy.visit('/');
    homePage.expectLoggedIn();

    homePage.goToAgendarTurno();

    cy.url().should('include', '/solicitar-turno');
    cy.url().should('not.include', '/401');
    cy.url().should('not.include', '/403');

    solicitarTurnoPage.expectPageVisible();
    solicitarTurnoPage.selectPacienteByIndex(1);
    solicitarTurnoPage.selectFirstService();
    solicitarTurnoPage.goToMedicoStep();
    solicitarTurnoPage.goToDisponibilidad();
    solicitarTurnoPage.selectFirstAvailableDay();
    solicitarTurnoPage.selectFirstSlot();
    solicitarTurnoPage.expectSlotAlert();
    solicitarTurnoPage.addTurnAndReturnToSearch();

    solicitarTurnoPage.expectCartCount('1');
    solicitarTurnoPage.openCartDropdown();
    solicitarTurnoPage.removeFirstCartItem();
    solicitarTurnoPage.expectCartEmpty();
  });
});

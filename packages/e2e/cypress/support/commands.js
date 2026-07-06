import loginPage from './pages/LoginPage';
import homePage from './pages/HomePage';

Cypress.Commands.add('loginAsPaciente', () => {
  const email = Cypress.env('E2E_USER_EMAIL');
  const password = Cypress.env('E2E_USER_PASSWORD');

  cy.session(
    [email, password],
    () => {
      loginPage.goto();
      loginPage.login(email, password);
    },
    { cacheAcrossSpecs: true },
  );

  homePage.goto();
  homePage.expectLoggedIn();
});

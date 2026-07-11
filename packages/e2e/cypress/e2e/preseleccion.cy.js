import homePage from '../support/pages/HomePage';
import solicitarTurnoPage from '../support/pages/SolicitarTurnoPage';
import '../support/commands';

describe('Preselección de Turno y Carrito', () => {
  beforeEach(() => {
    cy.loginAsPaciente();
  });

  it('Paciente busca, preselecciona y elimina un turno', () => {
    homePage.goToAgendarTurno();

    solicitarTurnoPage
      .expectPageVisible()
      .selectFirstService()
      .goToMedicoStep()
      .goToDisponibilidad()
      .selectFirstAvailableDay()
      .selectFirstSlot()
      .expectSlotAlert()
      .addTurnAndReturnToSearch();

    solicitarTurnoPage
      .expectCartCount('1')
      .openCartDropdown()
      .removeFirstCartItem()
      .expectCartEmpty();
  });
});

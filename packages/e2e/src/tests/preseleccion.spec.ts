import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { SolicitarTurnoPage } from '../pages/SolicitarTurnoPage';

const email = process.env.E2E_USER_EMAIL!;
const password = process.env.E2E_USER_PASSWORD!;

test.describe('Preselección de Turno y Carrito', () => {
  test('Paciente busca, preselecciona y elimina un turno', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);
    const solicitarTurnoPage = new SolicitarTurnoPage(page);

    await loginPage.goto();

    await Promise.all([
      page.waitForURL('**/', { timeout: 10000 }),
      loginPage.login(email, password),
    ]);

    await homePage.expectLoggedIn();
    await expect(page).not.toHaveURL(/.*\/login/, { timeout: 10000 });

    await homePage.goToAgendarTurno();

    await expect(page).toHaveURL(/.*\/solicitar-turno/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/.*\/(401|403)/, { timeout: 10000 });

    await solicitarTurnoPage.expectPageVisible();
    await solicitarTurnoPage.selectPacienteByIndex(1);
    await solicitarTurnoPage.selectFirstService();
    await solicitarTurnoPage.goToMedicoStep();
    await solicitarTurnoPage.goToDisponibilidad();
    await solicitarTurnoPage.selectFirstAvailableDay();
    await solicitarTurnoPage.selectFirstSlot();
    await solicitarTurnoPage.expectSlotAlert();
    await solicitarTurnoPage.addTurnAndReturnToSearch();

    await solicitarTurnoPage.expectCartCount('1');
    await solicitarTurnoPage.openCartDropdown();
    await solicitarTurnoPage.removeFirstCartItem();
    await solicitarTurnoPage.expectCartEmpty();
  });
});

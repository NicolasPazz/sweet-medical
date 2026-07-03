import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const email = process.env.E2E_USER_EMAIL!;
const password = process.env.E2E_USER_PASSWORD!;

test.describe('Autenticación de Usuarios', () => {
  test('debe mostrar toast de error con credenciales inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('usuario@invalido.com', 'asfsaf');
    await expect(loginPage.errorToast).toBeVisible();
    await expect(loginPage.errorToast).toHaveText(/El email y\/o contraseña son incorrectos/i);
  });

  test('debe mostrar toast de éxito al iniciar sesión con credenciales válidas', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await expect(loginPage.successToast).toBeVisible();
    await expect(loginPage.successToast).toHaveText(/Inicio de sesión exitoso/i);
    await expect(page).not.toHaveURL(/.*\/login/);
  });
});

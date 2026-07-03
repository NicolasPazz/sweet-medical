import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorToast: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page
      .getByLabel(/Correo electrónico/i)
      .or(page.getByPlaceholder('Tu correo electrónico'));
    this.passwordInput = page.getByLabel(/Contraseña/i).or(page.getByPlaceholder('Tu contraseña'));
    this.submitButton = page.getByRole('button', { name: /Iniciar sesión/i });
    this.errorToast = page.locator('.toast.toast-error');
    this.successToast = page.locator('.toast.toast-success');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, pass: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(pass);
    await this.submitButton.click();
  }
}

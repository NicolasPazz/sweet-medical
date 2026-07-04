import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly agendarLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /Bienvenido a Sweet Medical/i });
    this.agendarLink = page.locator('a[href="/solicitar-turno"]').first();
  }

  async expectLoggedIn() {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async goToAgendarTurno() {
    await expect(this.agendarLink).toBeVisible({ timeout: 10000 });
    await this.agendarLink.click();
  }
}

import { type Page, type Locator, expect } from '@playwright/test';

export class SolicitarTurnoPage {
  readonly page: Page;
  readonly pacienteSelect: Locator;
  readonly pacienteSelectedInfo: Locator;
  readonly firstServiceCard: Locator;
  readonly continuarButton: Locator;
  readonly verDisponibilidadButton: Locator;
  readonly availableDay: Locator;
  readonly firstSlot: Locator;
  readonly slotAlertInfo: Locator;
  readonly sumarTurnoButton: Locator;
  readonly cartCount: Locator;
  readonly cartButton: Locator;
  readonly cartDropdown: Locator;
  readonly cartEmptyText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pacienteSelect = page.locator('.paciente-select-dropdown');
    this.pacienteSelectedInfo = page.locator('.paciente-selected-info');
    this.firstServiceCard = page.locator('.service-card').first();
    this.continuarButton = page.getByRole('button', { name: /Continuar con/i });
    this.verDisponibilidadButton = page.getByRole('button', { name: /Ver Disponibilidad/i });
    this.availableDay = page.locator('.cal-day.has-slots').first();
    this.firstSlot = page.locator('.slot-btn').first();
    this.slotAlertInfo = page.locator('.slot-alert-info');
    this.sumarTurnoButton = page.getByRole('button', { name: /Sumar turno/i });
    this.cartCount = page.locator('.cart-count');
    this.cartButton = page.getByRole('button', { name: /Ver carrito/i });
    this.cartDropdown = page.locator('.cart-dropdown');
    this.cartEmptyText = page.getByText(/No tenés turnos en el carrito/i);
  }

  async expectPageVisible() {
    await expect(this.pacienteSelect).toBeVisible({ timeout: 10000 });
  }

  async selectPacienteByIndex(index: number) {
    await expect(this.pacienteSelect).toBeVisible({ timeout: 10000 });
    const optionCount = await this.pacienteSelect.locator('option').count();
    expect(optionCount).toBeGreaterThan(index);
    await this.pacienteSelect.selectOption({ index });
    await expect(this.pacienteSelectedInfo).toBeVisible();
  }

  async selectFirstService() {
    await expect(this.firstServiceCard).toBeVisible({ timeout: 10000 });
    await this.firstServiceCard.click();
  }

  async goToMedicoStep() {
    await expect(this.continuarButton).toBeVisible({ timeout: 10000 });
    await this.continuarButton.click();
  }

  async goToDisponibilidad() {
    await expect(this.verDisponibilidadButton).toBeVisible({ timeout: 10000 });
    await this.verDisponibilidadButton.click();
  }

  async selectFirstAvailableDay() {
    await expect(this.availableDay).toBeVisible({ timeout: 10000 });
    await this.availableDay.click();
  }

  async selectFirstSlot() {
    await expect(this.firstSlot).toBeVisible({ timeout: 10000 });
    await this.firstSlot.click();
  }

  async expectSlotAlert() {
    await expect(this.slotAlertInfo).toBeVisible({ timeout: 10000 });
  }

  async addTurnAndReturnToSearch() {
    await expect(this.sumarTurnoButton).toBeVisible({ timeout: 10000 });
    await this.sumarTurnoButton.click();
  }

  async expectCartCount(value: string) {
    await expect(this.cartCount).toBeVisible({ timeout: 10000 });
    await expect(this.cartCount).toHaveText(value);
  }

  async openCartDropdown() {
    await expect(this.cartButton).toBeVisible({ timeout: 10000 });
    await this.cartButton.click();
    await expect(this.cartDropdown).toBeVisible({ timeout: 10000 });
  }

  async removeFirstCartItem() {
    const removeBtn = this.cartDropdown.locator('button[title="Quitar del carrito"]').first();
    await expect(removeBtn).toBeVisible({ timeout: 10000 });
    await removeBtn.click();
  }

  async expectCartEmpty() {
    await expect(this.cartEmptyText).toBeVisible({ timeout: 10000 });
    await expect(this.cartCount).toHaveCount(0);
  }
}

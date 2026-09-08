const { expect } = require('@playwright/test');
const logger = require('../utils/logger');

class BasePage {
  constructor(page) {
    this.page = page;
    this.expect = expect;
  }

  async goto(path = '/') {
    logger.info(`Navigating to: ${path}`);
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async waitForLocator(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async safeFill(locator, value) {
    await locator.clear();
    await locator.fill(value);
  }

  async safeClick(locator) {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    await locator.click({ force: true, timeout: 20000 });
  }

  async expectVisible(locator) {
    await expect(locator).toBeVisible();
  }

  getCurrentUrl() {
    return this.page.url();
  }
}

module.exports = BasePage;

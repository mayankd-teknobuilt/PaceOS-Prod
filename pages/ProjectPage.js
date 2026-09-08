const BasePage = require('./BasePage');
const logger = require('../utils/logger');

class ProjectPage extends BasePage {
  constructor(page) {
    super(page);
    this.cookieConsentButton = page.getByRole('button', { name: 'I understand' });
    this.projectCards = page.locator('.MuiCard-root');
    this.projectMediaCards = page.locator('.MuiCardMedia-root');
    this.continueButton = page.locator('[role="dialog"]').getByRole('button', {
      name: 'Continue',
      exact: false
    });
    this.dialog = page.locator('[role="dialog"]');
  }

  async dismissCookieBanner() {
    if (await this.cookieConsentButton.isVisible().catch(() => false)) {
      logger.info('Dismissing cookie banner');
      await this.cookieConsentButton.click();
      await this.cookieConsentButton.waitFor({ state: 'hidden' }).catch(() => {});
    }
  }

  async selectFirstProject() {
    logger.info('Selecting first available project card');
    await this.dismissCookieBanner();
    const card = this.projectMediaCards.first();
    await card.waitFor({ state: 'visible', timeout: 30000 });
    await this.safeClick(card);
    await this.page.waitForTimeout(500);
  }

  async selectProject(projectName) {
    logger.info(`Selecting project: ${projectName}`);
    await this.dismissCookieBanner();
    await this.safeClick(this.projectCards.filter({ hasText: projectName }).first());
    await this.page.waitForTimeout(500);
  }

  async selectModule(moduleName) {
    logger.info(`Selecting module: ${moduleName}`);
    await this.safeClick(this.page.getByRole('button', { name: moduleName, exact: true }));
    await this.page.waitForTimeout(500);
  }

  async selectSubModule(subModuleName) {
    logger.info(`Selecting sub-module: ${subModuleName}`);
    await this.safeClick(this.page.getByRole('button', { name: subModuleName, exact: true }));
    await this.page.waitForTimeout(500);
  }

  async selectSubSubModule(subSubModuleName) {
    logger.info(`Selecting sub-sub-module: ${subSubModuleName}`);
    const radioOption = this.page.getByRole('radio', { name: subSubModuleName });
    if (await radioOption.isVisible().catch(() => false)) {
      await this.safeClick(radioOption);
    } else {
      await this.safeClick(this.page.getByText(subSubModuleName, { exact: true }));
    }
    await this.page.waitForTimeout(500);
  }

  async clickContinue() {
    logger.info('Clicking Continue button');
    await this.safeClick(this.continueButton);
    await this.dialog.waitFor({ state: 'hidden', timeout: 15000 });
    await this.page.waitForLoadState('domcontentloaded');
    logger.info(`Continue clicked — dialog closed. Landed on: ${this.page.url()}`);
  }
}

module.exports = ProjectPage;

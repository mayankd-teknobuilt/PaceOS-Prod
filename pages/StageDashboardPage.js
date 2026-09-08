const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const logger = require('../utils/logger');
const { ensureProdSession } = require('../utils/prodAuth');
const { selectProdProjectContext, isProjectContextSet } = require('../utils/prodProjectContext');
const { pauseForVisibility } = require('../utils/stageTiming');
const { isFastMode } = require('../utils/fastMode');
const { modules } = require('../testdata/stageModules');

const DASHBOARD_PATH = /dashboard/i;

class StageDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.cookieConsentButton = page.getByRole('button', { name: 'I understand' });
    this.tabs = page.getByRole('tab');
    this.loadingIndicator = page.locator('[role="progressbar"], .MuiCircularProgress-root');
    this.moduleCards = page.locator('.cubeBox:not(.cubeBlank)');
    this.dashboardUrl = null;
  }

  getDashboardUrl() {
    return new URL('/dashboard', process.env.BASE_URL).toString();
  }

  moduleCardLocator(moduleName) {
    return this.moduleCards
      .filter({ has: this.page.getByText(moduleName, { exact: true }) })
      .first();
  }

  tabLocator(tabName) {
    return this.page.getByRole('tab', { name: new RegExp(tabName, 'i') });
  }

  async openDashboard() {
    expect(process.env.BASE_URL, 'BASE_URL is required for production tests.').toBeTruthy();

    await ensureProdSession(this.page);
    await this.dismissCookieBanner();

    const onDashboard =
      DASHBOARD_PATH.test(this.page.url()) && (await isProjectContextSet(this.page));

    if (!onDashboard) {
      await selectProdProjectContext(this.page);
    }

    if (!DASHBOARD_PATH.test(this.page.url())) {
      await this.returnToDashboard();
    } else {
      await this.waitForDashboardReady();
    }

    this.dashboardUrl = this.getDashboardUrl();
    await pauseForVisibility(this.page, 'Dashboard ready');
    return this.page;
  }

  async returnToDashboard(tabName = null) {
    await this.page.bringToFront();

    const alreadyOnDashboard =
      DASHBOARD_PATH.test(this.page.url()) &&
      (await this.tabs.first().isVisible().catch(() => false));

    if (!alreadyOnDashboard) {
      await this.page.goto(this.getDashboardUrl(), { waitUntil: 'domcontentloaded' });
    }

    await this.dismissCookieBanner();
    await this.waitForDashboardReady();

    if (tabName) {
      await this.openTab(tabName);
    }

    this.dashboardUrl = this.page.url();
    return this.page;
  }

  async dismissCookieBanner() {
    if (await this.cookieConsentButton.isVisible().catch(() => false)) {
      logger.info('Dismissing cookie banner');
      await this.cookieConsentButton.click({ force: true });
      await this.cookieConsentButton.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }
  }

  async waitForDashboardReady() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    await expect(this.page, 'Dashboard did not load.').toHaveURL(DASHBOARD_PATH, { timeout: 30000 });
    await expect(this.tabs.first(), 'Dashboard categories did not load.').toBeVisible({ timeout: 30000 });

    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    }
  }

  async waitForModuleFullyLoaded(targetPage, moduleName) {
    expect(targetPage, `Module "${moduleName}" did not open.`).toBeTruthy();
    await targetPage.waitForLoadState('domcontentloaded', { timeout: 60000 });

    const loadingIndicator = targetPage.locator('[role="progressbar"], .MuiCircularProgress-root');
    if (await loadingIndicator.count()) {
      await loadingIndicator.first().waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
    }

    if (!isFastMode()) {
      await targetPage.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
      await targetPage.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => {
        logger.info(`networkidle timeout for ${moduleName}; page load event already fired.`);
      });
    }

    await expect(
      targetPage.locator('body'),
      `Module "${moduleName}" rendered an empty page.`
    ).not.toBeEmpty({ timeout: 20000 });

    await pauseForVisibility(targetPage, `Module fully loaded: ${moduleName}`);
  }

  async openTab(tabName) {
    const tab = this.tabLocator(tabName);
    await expect(tab, `Dashboard tab "${tabName}" was not found.`).toBeVisible({ timeout: 20000 });
    await tab.click({ force: true });
    await pauseForVisibility(this.page, `Opened tab: ${tabName}`);
    if (!isFastMode()) {
      await this.page.waitForTimeout(300);
    }
  }

  async openModule(moduleMeta, context) {
    const { moduleName, tabName, urlPattern } = moduleMeta;

    await this.returnToDashboard(tabName);

    const moduleCard = this.moduleCardLocator(moduleName);
    await expect(moduleCard, `Module "${moduleName}" was not visible on tab "${tabName}".`)
      .toBeVisible({ timeout: 20000 });

    logger.info(`Opening module: ${tabName} -> ${moduleName}`);
    if (!isFastMode()) {
      await pauseForVisibility(this.page, `About to open module: ${moduleName}`);
    }

    await moduleCard.scrollIntoViewIfNeeded();
    if (!isFastMode()) {
      await moduleCard.hover({ force: true });
      await moduleCard.evaluate(element =>
        new Promise(resolve => {
          const done = () => resolve();
          element.addEventListener('transitionend', done, { once: true });
          setTimeout(done, 500);
        })
      );
    }

    const popupPromise = context.waitForEvent('page', { timeout: 30000 });
    await moduleCard.click({ force: true });

    let openedPage = null;
    try {
      openedPage = await popupPromise;
    } catch {
      openedPage = null;
    }

    if (openedPage) {
      await openedPage.bringToFront();
      if (urlPattern) {
        await openedPage.waitForURL(urlPattern, { timeout: 60000 });
      }
      await this.waitForModuleFullyLoaded(openedPage, moduleName);
      logger.info(`Module opened in new tab: ${moduleName} | URL=${openedPage.url()}`);
      return { target: openedPage, openedInNewTab: true };
    }

    await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
    if (urlPattern) {
      await this.page.waitForURL(urlPattern, { timeout: 30000 }).catch(() => {});
    }
    await this.waitForModuleFullyLoaded(this.page, moduleName);
    logger.info(`Module opened in same tab: ${moduleName} | URL=${this.page.url()}`);
    return { target: this.page, openedInNewTab: false };
  }

  async closeModuleAndReturnToDashboard(moduleResult, tabName = null) {
    const { target, openedInNewTab } = moduleResult;

    if (openedInNewTab && target && !target.isClosed()) {
      await target.close();
    }

    await this.returnToDashboard(tabName);
  }

  async openAndValidateModule(moduleMeta, context, errorMonitor) {
    errorMonitor.reset();
    const result = await this.openModule(moduleMeta, context);
    errorMonitor.attach(result.target);
    await expect(result.target.locator('body')).not.toBeEmpty({ timeout: 20000 });
    errorMonitor.assertClean();
    await this.closeModuleAndReturnToDashboard(result, moduleMeta.tabName);
    return result;
  }

  /**
   * Login/session is already established by the fixture.
   * Opens every production dashboard module across all tabs.
   */
  async openEveryModule(context, errorMonitor, test) {
    await this.returnToDashboard();
    errorMonitor.assertClean();

    for (const moduleMeta of modules) {
      await test.step(`${moduleMeta.tabName}: ${moduleMeta.moduleName}`, async () => {
        await this.openAndValidateModule(moduleMeta, context, errorMonitor);
      });
    }
  }
}

module.exports = StageDashboardPage;

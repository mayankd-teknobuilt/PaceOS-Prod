const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const logger = require('../utils/logger');
const { ensureProdSession } = require('../utils/prodAuth');
const { selectProdProjectContext, isProjectContextSet } = require('../utils/prodProjectContext');
const { pauseForVisibility } = require('../utils/stageTiming');
const { isFastMode } = require('../utils/fastMode');
const { modules } = require('../testdata/stageModules');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');

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
    const label = this.page.locator('.cubeInnerText p').filter({ hasText: new RegExp(`^${this.escapeRegExp(moduleName)}$`, 'i') });
    return this.moduleCards.filter({ has: label }).first();
  }

  escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async waitForTabModules() {
    await expect(this.moduleCards.first(), 'Dashboard modules did not load for the selected tab.').toBeVisible({
      timeout: 30000
    });

    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    }
  }

  async resolveModuleCard(moduleMeta) {
    const { moduleName, tabName, moduleIndex } = moduleMeta;
    const byName = this.moduleCardLocator(moduleName);

    if (await byName.isVisible().catch(() => false)) {
      return byName;
    }

    if (typeof moduleIndex === 'number') {
      const byIndex = this.moduleCards.nth(moduleIndex);
      const indexVisible = await byIndex.isVisible().catch(() => false);
      if (indexVisible) {
        const label = (await byIndex.locator('.cubeInnerText p').first().innerText().catch(() => '')).trim();
        logger.info(`Resolved module "${moduleName}" by index ${moduleIndex} (label: "${label}") on tab "${tabName}".`);
        return byIndex;
      }
    }

    await expect(byName, `Module "${moduleName}" was not visible on tab "${tabName}".`).toBeVisible({
      timeout: 20000
    });
    return byName;
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
    await this.waitForTabModules();
    if (!isFastMode()) {
      await this.page.waitForTimeout(300);
    }
  }

  async waitForModulePage(context, urlPattern, timeout = 45000) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      for (const page of context.pages()) {
        if (!page.isClosed() && urlPattern.test(page.url())) {
          return page;
        }
      }
      await this.page.waitForTimeout(500);
    }

    return null;
  }

  isControlTowerModule(moduleName) {
    return moduleName === 'Digital Control Tower' || moduleName === 'HSE Plus Control Tower';
  }

  async openControlTowerModule(context, moduleName) {
    const ControlTowerNavigationPage = require('./control-tower/ControlTowerNavigationPage');
    const navigation = new ControlTowerNavigationPage(this.page);
    const errorMonitor = createErrorMonitor();
    const ctPage = await navigation.openControlTowerFromDashboard(context, errorMonitor);
    await ctPage.bringToFront();
    await this.waitForModuleFullyLoaded(ctPage, moduleName);
    logger.info(`Control Tower module opened: ${moduleName} | URL=${ctPage.url()}`);
    return { target: ctPage, openedInNewTab: true };
  }

  async openModule(moduleMeta, context) {
    const { moduleName, tabName, urlPattern } = moduleMeta;

    await this.returnToDashboard(tabName);

    if (moduleName === 'Digital Control Tower') {
      return this.openControlTowerModule(context, moduleName);
    }

    const moduleCard = await this.resolveModuleCard(moduleMeta);

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

    const pageCountBefore = context.pages().length;
    const popupPromise = context.waitForEvent('page', { timeout: 45000 });
    await moduleCard.click({ force: true });

    let openedPage = null;
    try {
      openedPage = await popupPromise;
    } catch {
      const pages = context.pages();
      if (pages.length > pageCountBefore) {
        openedPage = pages[pages.length - 1];
      }
    }

    if (!openedPage && urlPattern) {
      openedPage = await this.waitForModulePage(context, urlPattern, 45000);
    }

    if (!openedPage && urlPattern) {
      try {
        await this.page.waitForURL(urlPattern, { timeout: 30000 });
        openedPage = this.page;
      } catch {
        openedPage = null;
      }
    }

    if (openedPage && openedPage !== this.page) {
      await openedPage.bringToFront();
      if (urlPattern) {
        await openedPage.waitForURL(urlPattern, { timeout: 60000 }).catch(() => {});
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

    if (!openedInNewTab && !DASHBOARD_PATH.test(this.page.url())) {
      await this.page.goto(this.getDashboardUrl(), { waitUntil: 'domcontentloaded' });
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

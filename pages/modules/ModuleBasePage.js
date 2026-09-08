const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');
const StageDashboardPage = require('../StageDashboardPage');
const { getByName } = require('../../testdata/stageModules');

const VISIBLE_ERROR_SELECTORS = [
  'text=/\\b(400|401|403|404|500|502|503)\\b/i',
  'text=/bad request/i',
  'text=/not found/i',
  'text=/internal server error/i',
  'text=/something went wrong/i',
  'text=/application error/i'
].join(', ');

class ModuleBasePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} moduleName - must exist in testdata/stageModules.js
   * @param {{ urlPattern?: RegExp }} [options]
   */
  constructor(page, moduleName, options = {}) {
    super(page);
    this.meta = {
      ...getByName(moduleName),
      ...(options.urlPattern ? { urlPattern: options.urlPattern } : {})
    };
    this.targetPage = null;
    this.openedInNewTab = false;
  }

  async open(context) {
    const dashboard = new StageDashboardPage(this.page);

    if (!/dashboard/i.test(this.page.url())) {
      await dashboard.openDashboard();
    } else {
      await dashboard.dismissCookieBanner();
      await dashboard.waitForDashboardReady();
    }

    const result = await dashboard.openModule(this.meta, context);
    this.targetPage = result.target;
    this.openedInNewTab = result.openedInNewTab;
    return this.targetPage;
  }

  async waitForReady(targetPage = this.targetPage) {
    const dashboard = new StageDashboardPage(this.page);
    await dashboard.waitForModuleFullyLoaded(targetPage, this.meta.moduleName);
  }

  async assertNoVisibleErrorPage(targetPage = this.targetPage) {
    expect(targetPage, 'Module page was not opened.').toBeTruthy();
    await expect(
      targetPage.locator(VISIBLE_ERROR_SELECTORS),
      `Module "${this.meta.moduleName}" shows a visible error state.`
    ).toHaveCount(0, { timeout: 5000 });
  }

  /** Override in module pages for module-specific ready checks. */
  async assertLoaded(_targetPage = this.targetPage) {}

  async closeIfNewTab(dashboardPage = this.page) {
    const dashboard = new StageDashboardPage(dashboardPage);
    await dashboard.closeModuleAndReturnToDashboard(
      { target: this.targetPage, openedInNewTab: this.openedInNewTab },
      this.meta.tabName
    );
  }

  /**
   * Full open → load → assert → close flow. Specs should call only this.
   */
  async runOpenLoadCheck(context, errorMonitor, dashboardPage = this.page) {
    errorMonitor.reset();
    const target = await this.open(context);

    if (!target || target.isClosed()) {
      throw new Error(`Module "${this.meta.moduleName}" tab closed before validation.`);
    }

    errorMonitor.attach(target);
    await this.assertLoaded(target);
    await this.assertNoVisibleErrorPage(target);
    errorMonitor.assertClean();

    await this.closeIfNewTab(dashboardPage);
    return target;
  }
}

module.exports = ModuleBasePage;

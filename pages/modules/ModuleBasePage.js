const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');
const StageDashboardPage = require('../StageDashboardPage');
const { getByName } = require('../../testdata/stageModules');
const { REPORT_ATTEMPTS } = require('../../utils/testTiming');
const logger = require('../../utils/logger');

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
    this.moduleName = moduleName;
    this._options = options;
    this.meta = null;
    this.targetPage = null;
    this.openedInNewTab = false;
  }

  resolveMeta() {
    if (!this.meta) {
      this.meta = {
        ...getByName(this.moduleName),
        ...(this._options.urlPattern ? { urlPattern: this._options.urlPattern } : {})
      };
    }
    return this.meta;
  }

  async open(context) {
    const meta = this.resolveMeta();
    const dashboard = new StageDashboardPage(this.page);

    if (!/dashboard/i.test(this.page.url())) {
      await dashboard.openDashboard();
    } else {
      await dashboard.dismissCookieBanner();
      await dashboard.waitForDashboardReady();
    }

    const result = await dashboard.openModule(meta, context);
    this.targetPage = result.target;
    this.openedInNewTab = result.openedInNewTab;
    return this.targetPage;
  }

  async waitForReady(targetPage = this.targetPage) {
    const meta = this.resolveMeta();
    const dashboard = new StageDashboardPage(this.page);
    await dashboard.waitForModuleFullyLoaded(targetPage, meta.moduleName);
  }

  async assertNoVisibleErrorPage(targetPage = this.targetPage) {
    const meta = this.resolveMeta();
    expect(targetPage, 'Module page was not opened.').toBeTruthy();
    await expect(
      targetPage.locator(VISIBLE_ERROR_SELECTORS),
      `Module "${meta.moduleName}" shows a visible error state.`
    ).toHaveCount(0, { timeout: 5000 });
  }

  /** Override in module pages for module-specific ready checks. */
  async assertLoaded(_targetPage = this.targetPage) {}

  async closeIfNewTab(dashboardPage = this.page) {
    const meta = this.resolveMeta();
    const dashboard = new StageDashboardPage(dashboardPage);
    await dashboard.closeModuleAndReturnToDashboard(
      { target: this.targetPage, openedInNewTab: this.openedInNewTab },
      meta.tabName
    );
  }

  async runOpenLoadCheck(context, errorMonitor, dashboardPage = this.page) {
    let lastError = null;
    const meta = this.resolveMeta();

    for (let attempt = 1; attempt <= REPORT_ATTEMPTS; attempt++) {
      try {
        errorMonitor.reset();
        const target = await this.open(context);

        if (!target || target.isClosed()) {
          throw new Error(`Module "${meta.moduleName}" tab closed before validation.`);
        }

        errorMonitor.attach(target);
        await this.assertLoaded(target);
        await this.assertNoVisibleErrorPage(target);
        errorMonitor.assertClean();

        await this.closeIfNewTab(dashboardPage);
        return target;
      } catch (error) {
        lastError = error;
        if (attempt < REPORT_ATTEMPTS) {
          logger.warn(
            `Module "${meta.moduleName}" attempt ${attempt}/${REPORT_ATTEMPTS} failed: ${error.message}`
          );
          const dashboard = new StageDashboardPage(dashboardPage);
          await dashboard.navigateToDashboardWithRecovery().catch(() => {});
        }
      }
    }

    throw lastError;
  }
}

module.exports = ModuleBasePage;

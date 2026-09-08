const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');
const logger = require('../../utils/logger');
const { pauseForVisibility } = require('../../utils/stageTiming');
const { isFastMode } = require('../../utils/fastMode');
const { CONTROL_TOWER_URL, portfolioUrl } = require('../../testdata/control-tower/shared');

const VISIBLE_ERROR_SELECTORS = [
  'text=/\\b(400|401|403|404|500|502|503)\\b/i',
  'text=/bad request/i',
  'text=/internal server error/i',
  'text=/something went wrong/i',
  'text=/application error/i'
].join(', ');

class ControlTowerReportsPage extends BasePage {
  constructor(page) {
    super(page);
    this.reportsPage = page;
    this.loadingIndicator = page.locator('[role="progressbar"], .MuiCircularProgress-root');
    this.openListbox = page.locator('[role="listbox"]:visible');
    this.downloadButton = page.getByRole('button', { name: /download csv/i });
    this.noDataMessage = page.getByText(/sorry!?\s*no result found/i);
  }

  setReportsPage(page) {
    this.reportsPage = page;
    this.loadingIndicator = page.locator('[role="progressbar"], .MuiCircularProgress-root');
    this.openListbox = page.locator('[role="listbox"]:visible');
    this.downloadButton = page.getByRole('button', { name: /download csv/i });
    this.noDataMessage = page.getByText(/sorry!?\s*no result found/i);
  }

  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  buttonLocator(label, { exact = true } = {}) {
    return this.reportsPage.getByRole('button', { name: label, exact });
  }

  filterButtonLocator(label) {
    return this.reportsPage
      .locator('[role="tabpanel"]:visible')
      .getByRole('button', { name: label, exact: true })
      .first();
  }

  tabLocator(label) {
    return this.reportsPage.getByRole('tab', { name: label });
  }

  optionLocator(optionName) {
    return this.reportsPage.getByRole('option', { name: new RegExp(this.escapeRegex(optionName), 'i') }).first();
  }

  /** Main Intelligence report combobox (excludes pagination controls). */
  async findVisibleIntelligenceCombobox() {
    const comboboxes = this.reportsPage.getByRole('combobox');
    const count = await comboboxes.count();

    for (let i = 0; i < count; i++) {
      const candidate = comboboxes.nth(i);
      if (!(await candidate.isVisible().catch(() => false))) continue;

      const ariaLabel = ((await candidate.getAttribute('aria-label')) || '').toLowerCase();
      const text = ((await candidate.textContent()) || '').toLowerCase();
      if (ariaLabel.includes('rows per page') || text.includes('rows per page')) continue;

      return candidate;
    }

    return null;
  }

  async ensureControlTowerTabActive() {
    if (this.reportsPage.isClosed()) {
      throw new Error('Control Tower tab was closed before report selection.');
    }

    await this.reportsPage.bringToFront();

    if (!CONTROL_TOWER_URL.test(this.reportsPage.url())) {
      logger.info('Control Tower tab left host — navigating back.');
      await this.reportsPage.goto(portfolioUrl, { waitUntil: 'domcontentloaded' });
      await this.waitForControlTowerShell();
      return;
    }

    if (!/#\/portfolio/i.test(this.reportsPage.url())) {
      logger.info('Control Tower not on portfolio view — navigating to portfolio.');
      await this.reportsPage.goto(portfolioUrl, { waitUntil: 'domcontentloaded' });
      await this.waitForControlTowerShell();
    }
  }

  async waitForPortfolioReady() {
    await this.ensureControlTowerTabActive();
    await expect(
      this.reportsPage.getByRole('tab', { name: 'Project Progress' }),
      'Control Tower portfolio tabs were not visible.'
    ).toBeVisible({ timeout: 60000 });
    await expect(
      this.reportsPage.getByRole('button', { name: 'Utilization Trend' }),
      'Project Progress trend actions were not visible on Control Tower.'
    ).toBeVisible({ timeout: 30000 });
    await this.waitForReportSettle();
  }

  async waitForPortfolioTrendButtons() {
    await this.waitForPortfolioReady();
  }

  async getIntelligenceCombobox() {
    await this.ensureControlTowerTabActive();

    let combobox = null;
    await expect(async () => {
      await this.dismissOpenMenus();
      combobox = await this.findVisibleIntelligenceCombobox();
      expect(
        combobox,
        `Intelligence report combobox was not found (url: ${this.reportsPage.url()}).`
      ).toBeTruthy();
    }).toPass({ timeout: 30000 });

    return combobox;
  }

  /** Close MUI dropdowns without clicking the invisible backdrop (avoids detach timeouts). */
  async dismissOpenMenus() {
    for (let attempt = 0; attempt < 3; attempt++) {
      const listboxOpen = await this.openListbox.isVisible().catch(() => false);
      const expandedCombobox = await this.reportsPage
        .locator('[role="combobox"][aria-expanded="true"]')
        .first()
        .isVisible()
        .catch(() => false);

      if (!listboxOpen && !expandedCombobox) {
        return;
      }

      await this.reportsPage.keyboard.press('Escape');
      await this.openListbox.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      await this.reportsPage.waitForTimeout(150);
    }
  }

  async waitForControlTowerShell() {
    await expect(this.reportsPage).toHaveURL(CONTROL_TOWER_URL, { timeout: 60000 });
    await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 60000 });
    await expect(this.reportsPage.locator('body')).not.toBeEmpty({ timeout: 20000 });
    await pauseForVisibility(this.reportsPage, 'Control Tower portfolio ready');
  }

  async waitForReportSettle({ quick = false } = {}) {
    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    }

    const fast = isFastMode();
    const settleMs = quick ? (fast ? 100 : 250) : fast ? 200 : 800;
    if (settleMs > 0) {
      await this.reportsPage.waitForTimeout(settleMs);
    }
  }

  async waitForSetupStep(viewName) {
    await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
    }

    await this.dismissOpenMenus();
    await this.waitForReportSettle({ quick: true });
    logger.info(`Setup step ready: ${viewName}`);
  }

  async waitForViewLoaded(viewName) {
    await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: 60000 });

    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});
    }

    if (!isFastMode()) {
      await this.reportsPage.waitForLoadState('load', { timeout: 60000 }).catch(() => {});
      await this.reportsPage.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {
        logger.info(`networkidle timeout for "${viewName}"; continuing after load event.`);
      });
    }

    await this.waitForReportSettle();

    await expect(
      this.reportsPage.locator('body'),
      `View "${viewName}" rendered an empty page.`
    ).not.toBeEmpty({ timeout: 20000 });

    await pauseForVisibility(this.reportsPage, `Loaded: ${viewName}`);
  }

  async assertNoVisibleErrorPage() {
    await expect(
      this.reportsPage.locator(VISIBLE_ERROR_SELECTORS),
      'Control Tower shows a visible error state.'
    ).toHaveCount(0, { timeout: 5000 });
  }

  async assertSetupClean(errorMonitor) {
    await this.dismissOpenMenus();
    errorMonitor.assertClean();
  }

  async assertStepClean(errorMonitor) {
    await this.waitForReportSettle();
    await this.assertNoVisibleErrorPage();
    errorMonitor.assertClean();
  }

  /**
   * No data → download disabled is OK.
   * Data present → download must succeed or the test fails.
   */
  async assertDownloadBehavior(reportName) {
    const downloadBtn = this.downloadButton.first();
    const downloadVisible = await downloadBtn.isVisible().catch(() => false);

    if (!downloadVisible) {
      logger.info(`Report "${reportName}" has no Download CSV button — skipping download check.`);
      return;
    }

    const noData = await this.noDataMessage.isVisible().catch(() => false);
    const isDisabled = await downloadBtn.isDisabled();

    if (noData || isDisabled) {
      logger.info(`Report "${reportName}" has no data — download not required.`);
      return;
    }

    logger.info(`Report "${reportName}" has data — verifying CSV download.`);
    const downloadPromise = this.reportsPage.waitForEvent('download', { timeout: 30000 });
    await downloadBtn.click();
    const download = await downloadPromise;

    expect(download, `Report "${reportName}" download did not start.`).toBeTruthy();
    const filename = download.suggestedFilename();
    expect(filename, `Report "${reportName}" returned an empty filename.`).toBeTruthy();
    logger.info(`Report "${reportName}" downloaded: ${filename}`);
    await this.reportsPage.bringToFront();
  }

  async clickButton(label, stepName, options = {}) {
    const button = options.filter
      ? this.filterButtonLocator(label)
      : this.buttonLocator(label, { exact: options.exact ?? true });

    await expect(button, `Button "${label}" was not found.`).toBeVisible({ timeout: 20000 });
    await button.click();

    if (options.setup) {
      await this.waitForSetupStep(stepName || label);
      return;
    }

    if (options.filter) {
      await this.waitForReportSettle({ quick: true });
      return;
    }

    await this.waitForViewLoaded(stepName || label);
  }

  async openTab(label, options = {}) {
    const tab = this.tabLocator(label);
    await expect(tab, `Tab "${label}" was not found.`).toBeVisible({ timeout: 20000 });
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });

    if (options.setup) {
      await this.waitForSetupStep(`Opened tab: ${label}`);
      return;
    }

    await this.waitForReportSettle();
    await pauseForVisibility(this.reportsPage, `Opened tab: ${label}`);
  }

  async selectReport(step, options = {}) {
    await this.ensureControlTowerTabActive();

    await expect(async () => {
      await this.dismissOpenMenus();

      const combobox = await this.findVisibleIntelligenceCombobox();
      expect(combobox, `Combobox not found for "${step.name}".`).toBeTruthy();

      await combobox.scrollIntoViewIfNeeded();
      await combobox.click();

      const option = this.optionLocator(step.option);
      await expect(option, `Report option "${step.option}" was not visible.`).toBeVisible({
        timeout: 10000
      });
      await option.scrollIntoViewIfNeeded();
      await option.click();
      await this.dismissOpenMenus();
    }).toPass({ timeout: 45000 });

    if (options.setup) {
      await this.waitForSetupStep(step.name);
      return;
    }

    await this.waitForViewLoaded(step.name);
  }

  async executeStep(step, options = {}) {
    if (step.type === 'tab') {
      await this.openTab(step.label, options);
      return;
    }

    if (step.type === 'button') {
      const isFilter = ['Stopped', 'CWP', 'EWP', 'IWP'].includes(step.label);
      await this.clickButton(step.label, step.name, { filter: isFilter, setup: options.setup });
      return;
    }

    if (step.type === 'report') {
      await this.selectReport(step, options);
    }
  }

  async openTrendViews(trendLabels, test, errorMonitor) {
    await test.step('Trend Views', async () => {
      for (const label of trendLabels) {
        await test.step(`Trend: ${label}`, async () => {
          errorMonitor.reset();
          await this.clickButton(label, label);
          await this.assertStepClean(errorMonitor);
        });
      }
    });
  }

  async openCategory(category, test, errorMonitor) {
    if (category.prepareTrendViews?.length) {
      await this.openTrendViews(category.prepareTrendViews, test, errorMonitor);
    }

    if (category.entry?.length) {
      await test.step(`Section: ${category.name}`, async () => {
        for (const entry of category.entry) {
          if (entry.type === 'tab') {
            errorMonitor.reset();
            await this.openTab(entry.label);
            await this.assertStepClean(errorMonitor);
          }
        }

        for (const step of category.steps) {
          await test.step(step.name, async () => {
            errorMonitor.reset();
            await this.executeStep(step);
            await this.assertDownloadBehavior(step.name);
            await this.assertStepClean(errorMonitor);
          });
        }
      });
      return;
    }

    // Daily progress — trend buttons only
    await test.step(`Section: ${category.name}`, async () => {
      for (const step of category.steps) {
        await test.step(step.name, async () => {
          errorMonitor.reset();
          await this.executeStep(step);
          await this.assertStepClean(errorMonitor);
        });
      }
    });
  }
}

module.exports = ControlTowerReportsPage;

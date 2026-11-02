const { expect } = require('@playwright/test');
const BasePage = require('../BasePage');
const logger = require('../../utils/logger');
const { pauseForVisibility } = require('../../utils/stageTiming');
const { isFastMode } = require('../../utils/fastMode');
const { DOWNLOAD_TIMEOUT_MS, CT_VIEW_LOAD_MS, SLOW_CT_REPORTS } = require('../../utils/testTiming');
const {
  getPortfolioUrl,
  getControlTowerUrlPattern,
  getControlTowerDiscoveryTabs
} = require('../../testdata/control-tower/shared');
const { getPaceEnvKey } = require('../../utils/paceEnv');

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
    this.downloadButton = page.getByRole('button', { name: /download(\s+csv)?/i });
    this.noDataMessage = page.getByText(/sorry!?\s*no result found/i);
  }

  setReportsPage(page) {
    this.reportsPage = page;
    this.loadingIndicator = page.locator('[role="progressbar"], .MuiCircularProgress-root');
    this.openListbox = page.locator('[role="listbox"]:visible');
    this.downloadButton = page.getByRole('button', { name: /download(\s+csv)?/i });
    this.noDataMessage = page.getByText(/sorry!?\s*no result found/i);
  }

  escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  buttonLocator(label, { exact = true } = {}) {
    return this.reportsPage.getByRole('button', { name: label, exact });
  }

  filterButtonLocator(label) {
    const panel = this.reportsPage.locator('[role="tabpanel"]:visible').last();
    return panel.getByRole('button', { name: label, exact: true }).first();
  }

  async clickFilterButton(label, stepName, { setup = false } = {}) {
    await expect(async () => {
      const scopes = [
        this.reportsPage.locator('[role="tabpanel"]:visible').last(),
        this.reportsPage
      ];
      let clicked = false;
      for (const scope of scopes) {
        const button = scope.getByRole('button', { name: label, exact: true }).first();
        if (!(await button.isVisible().catch(() => false))) continue;
        await button.scrollIntoViewIfNeeded().catch(() => {});
        await button.click({ timeout: 10000 });
        clicked = true;
        break;
      }
      expect(clicked, `Filter button "${label}" was not clickable.`).toBeTruthy();
    }).toPass({ timeout: 30000 });

    if (setup) {
      await this.waitForSetupStep(stepName || `Filter: ${label}`);
      return;
    }

    await this.waitForReportSettle({ quick: true });
  }

  portfolioTabListLocator() {
    return this.reportsPage.locator('[data-portfolio-tablist="true"]');
  }

  async resolvePortfolioTabList() {
    const marked = this.portfolioTabListLocator();
    if ((await marked.count().catch(() => 0)) > 0) {
      return marked;
    }

    const lists = this.reportsPage.getByRole('tablist');
    const listCount = await lists.count().catch(() => 0);
    let bestList = lists.first();
    let bestSize = 0;

    for (let i = 0; i < listCount; i++) {
      const list = lists.nth(i);
      const tabCount = await list.getByRole('tab').count().catch(() => 0);
      if (tabCount > bestSize) {
        bestSize = tabCount;
        bestList = list;
      }
    }

    return bestList;
  }

  tabLocator(label, { nested = false } = {}) {
    if (nested) {
      const panel = this.reportsPage.locator('[role="tabpanel"]:visible').last();
      const innerList = panel.locator('[role="tablist"]').last();
      return innerList.getByRole('tab', { name: label });
    }
    return this.reportsPage.getByRole('tab', {
      name: new RegExp(`^${this.escapeRegex(label)}$`, 'i')
    }).first();
  }

  optionLocator(optionName, root = this.reportsPage) {
    return root.getByRole('option', { name: new RegExp(this.escapeRegex(optionName), 'i') }).first();
  }

  async revealListboxOption(listbox, optionLabel) {
    const option = this.optionLocator(optionLabel, listbox);

    if (await option.isVisible().catch(() => false)) {
      return option;
    }

    await listbox.evaluate(element => {
      element.scrollTop = 0;
    }).catch(() => {});
    await this.reportsPage.waitForTimeout(150);
    if (await option.isVisible().catch(() => false)) {
      return option;
    }

    await this.reportsPage.keyboard.press('Escape').catch(() => {});
    const filterText = optionLabel.replace(/\s+/g, ' ').trim();
    const typeahead = filterText.split(' ').slice(0, 3).join(' ').slice(0, 20);
    if (typeahead.length >= 3) {
      await this.reportsPage.keyboard.type(typeahead, { delay: 25 }).catch(() => {});
      await this.reportsPage.waitForTimeout(200);
      if (await option.isVisible().catch(() => false)) {
        return option;
      }
    }

    const scrollRounds = filterText.length > 28 ? 32 : 22;
    for (let attempt = 0; attempt < scrollRounds; attempt++) {
      if (await option.isVisible().catch(() => false)) {
        return option;
      }

      await listbox.evaluate(element => {
        element.scrollTop += 220;
      }).catch(() => {});
      await this.reportsPage.keyboard.press('ArrowDown').catch(() => {});
      await this.reportsPage.waitForTimeout(100);
    }

    return option;
  }

  async selectComboboxOption(combobox, optionLabel) {
    await this.dismissOpenMenus();
    await combobox.scrollIntoViewIfNeeded();
    await combobox.click();

    const listbox = this.openListbox;
    await expect(listbox, `Report listbox did not open for "${optionLabel}".`).toBeVisible({
      timeout: 15000
    });

    const option = await this.revealListboxOption(listbox, optionLabel);
    await expect(option, `Report option "${optionLabel}" was not visible.`).toBeVisible({
      timeout: 20000
    });
    await option.scrollIntoViewIfNeeded();
    await option.click();
    await this.dismissOpenMenus();
  }

  /** Main Intelligence report combobox (excludes pagination controls). */
  async findVisibleIntelligenceCombobox() {
    const scopes = [
      this.reportsPage.locator('[role="tabpanel"]:visible').last(),
      this.reportsPage
    ];

    for (const scope of scopes) {
      const comboboxes = scope.getByRole('combobox');
      const count = await comboboxes.count().catch(() => 0);

      for (let i = 0; i < count; i++) {
        const candidate = comboboxes.nth(i);
        if (!(await candidate.isVisible().catch(() => false))) continue;

        const ariaLabel = ((await candidate.getAttribute('aria-label')) || '').toLowerCase();
        const text = ((await candidate.textContent()) || '').toLowerCase();
        if (ariaLabel.includes('rows per page') || text.includes('rows per page')) continue;

        return candidate;
      }
    }

    return null;
  }

  async ensureControlTowerTabActive() {
    if (this.reportsPage.isClosed()) {
      throw new Error('Control Tower tab was closed before report selection.');
    }

    await this.reportsPage.bringToFront();
    const ctHostPattern = getControlTowerUrlPattern();
    const portfolio = getPortfolioUrl();

    if (!ctHostPattern.test(this.reportsPage.url())) {
      logger.info('Control Tower tab left host — navigating back.');
      await this.reportsPage.goto(portfolio, { waitUntil: 'domcontentloaded' });
      await this.waitForControlTowerShell();
      return;
    }

    if (!/#\/portfolio/i.test(this.reportsPage.url())) {
      logger.info('Control Tower not on portfolio view — navigating to portfolio.');
      await this.reportsPage.goto(portfolio, { waitUntil: 'domcontentloaded' });
      await this.waitForControlTowerShell();
    }
  }

  async waitForDev3PortfolioTabs() {
    const tabList = await this.resolvePortfolioTabList();
    await expect(tabList, 'Dev3 portfolio tab list was not visible.').toBeVisible({ timeout: 60000 });

    const labels = getControlTowerDiscoveryTabs('dev3');
    for (const label of labels) {
      const tab = tabList.getByRole('tab', {
        name: new RegExp(`^${this.escapeRegex(label)}$`, 'i')
      });
      if (await tab.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        return;
      }
    }

    await expect(
      tabList.getByRole('tab').first(),
      'Dev3 Control Tower portfolio tabs were not visible.'
    ).toBeVisible({ timeout: 30000 });
  }

  async waitForProdPortfolioTabs() {
    const tabList = await this.resolvePortfolioTabList();
    await expect(tabList, 'Portfolio tab list was not visible.').toBeVisible({ timeout: 60000 });

    const labels = getControlTowerDiscoveryTabs('prod');
    for (const label of labels) {
      const tab = tabList.getByRole('tab', {
        name: new RegExp(`^${this.escapeRegex(label)}$`, 'i')
      });
      if (await tab.first().isVisible({ timeout: 5000 }).catch(() => false)) {
        return;
      }
    }

    await expect(
      tabList.getByRole('tab').first(),
      'Control Tower portfolio tabs were not visible.'
    ).toBeVisible({ timeout: 30000 });
  }

  async reloadPortfolioAndWaitForTabs(waitFn) {
    logger.warn('Portfolio tabs missing — reloading portfolio view.');
    await this.reportsPage.goto(getPortfolioUrl(), { waitUntil: 'domcontentloaded' });
    await this.waitForControlTowerShell();
    await waitFn.call(this);
  }

  async waitForPortfolioReady() {
    await this.ensureControlTowerTabActive();

    if (getPaceEnvKey() === 'dev3') {
      try {
        await this.waitForDev3PortfolioTabs();
      } catch (err) {
        logger.warn(`Dev3 portfolio tabs missing — reloading portfolio: ${err.message}`);
        await this.reloadPortfolioAndWaitForTabs(this.waitForDev3PortfolioTabs);
      }
      await expect(
        this.reportsPage.getByText(/Intelligence/i).first(),
        'Dev3 Control Tower Intelligence panel was not visible.'
      ).toBeVisible({ timeout: 30000 });
    } else {
      try {
        await this.waitForProdPortfolioTabs();
      } catch (err) {
        logger.warn(`Prod portfolio tabs missing — reloading portfolio: ${err.message}`);
        await this.reloadPortfolioAndWaitForTabs(this.waitForProdPortfolioTabs);
      }
    }

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
    await expect(this.reportsPage).toHaveURL(getControlTowerUrlPattern(), { timeout: 60000 });
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
    await this.reportsPage.waitForLoadState('domcontentloaded', { timeout: CT_VIEW_LOAD_MS });

    if (await this.loadingIndicator.count()) {
      await this.loadingIndicator.first().waitFor({ state: 'hidden', timeout: CT_VIEW_LOAD_MS }).catch(() => {});
    }

    if (!isFastMode()) {
      await this.reportsPage.waitForLoadState('load', { timeout: CT_VIEW_LOAD_MS }).catch(() => {});
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

    let lastError;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const downloadPromise = this.reportsPage.waitForEvent('download', {
          timeout: DOWNLOAD_TIMEOUT_MS
        });
        await downloadBtn.click();
        const download = await downloadPromise;

        expect(download, `Report "${reportName}" download did not start.`).toBeTruthy();
        const filename = download.suggestedFilename();
        expect(filename, `Report "${reportName}" returned an empty filename.`).toBeTruthy();
        logger.info(`Report "${reportName}" downloaded: ${filename}`);
        await this.reportsPage.bringToFront();
        return;
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          logger.warn(
            `Report "${reportName}" download attempt ${attempt}/2 failed: ${error.message}`
          );
          await this.reportsPage.bringToFront();
          await this.waitForReportSettle({ quick: true });
        }
      }
    }

    throw lastError;
  }

  async clickButton(label, stepName, options = {}) {
    if (options.filter) {
      await this.clickFilterButton(label, stepName || label, { setup: !!options.setup });
      return;
    }

    const button = this.buttonLocator(label, { exact: options.exact ?? true });

    await expect(button, `Button "${label}" was not found.`).toBeVisible({ timeout: 20000 });
    await button.click();

    if (options.setup) {
      await this.waitForSetupStep(stepName || label);
      return;
    }

    await this.waitForViewLoaded(stepName || label);
  }

  async scrollManagementTabsIntoView(label) {
    const panel = this.reportsPage.locator('[role="tabpanel"]:visible').last();
    const tabLists = panel.locator('[role="tablist"]');
    const listCount = await tabLists.count().catch(() => 0);

    for (let i = 0; i < listCount; i++) {
      await tabLists
        .nth(i)
        .evaluate((listEl, tabLabel) => {
          const norm = text => (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
          for (const el of listEl.querySelectorAll('[role="tab"], button')) {
            if (norm(el.textContent) !== tabLabel.toLowerCase()) continue;
            el.scrollIntoView({ block: 'nearest', inline: 'center' });
          }
        }, label)
        .catch(() => {});
    }
  }

  async resolveManagementControl(label) {
    const pattern = new RegExp(`^${this.escapeRegex(label)}$`, 'i');
    const panel = this.reportsPage.locator('[role="tabpanel"]:visible').last();

    for (const scope of [panel, this.reportsPage]) {
      const tab = scope.getByRole('tab', { name: pattern }).first();
      if ((await tab.count().catch(() => 0)) > 0) {
        return tab;
      }
      const button = scope.getByRole('button', { name: pattern }).first();
      if ((await button.count().catch(() => 0)) > 0) {
        return button;
      }
    }

    return null;
  }

  async openManagementSection(label, options = {}) {
    await expect(async () => {
      await this.scrollManagementTabsIntoView(label);
      const control = await this.resolveManagementControl(label);
      expect(control, `Management section "${label}" was not found.`).toBeTruthy();
      await control.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
      await control.click({ timeout: 15000 });
      const role = await control.getAttribute('role').catch(() => '');
      if (role === 'tab') {
        await expect(control).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
      }
    }).toPass({ timeout: 45000 });

    if (options.setup) {
      await this.waitForSetupStep(`Management section: ${label}`);
      return;
    }

    await this.waitForReportSettle();
    await pauseForVisibility(this.reportsPage, `Management section: ${label}`);
  }

  async openTab(label, options = {}) {
    await this.ensureControlTowerTabActive();
    await expect(this.reportsPage.getByRole('tab').first(), 'Control Tower tabs did not load.').toBeVisible({
      timeout: 30000
    });

    let tab = this.tabLocator(label, { nested: !!options.nested });
    if (!options.nested) {
      const portfolioList = await this.resolvePortfolioTabList();
      tab = portfolioList
        .getByRole('tab', { name: new RegExp(`^${this.escapeRegex(label)}$`, 'i') })
        .first();
      await portfolioList
        .evaluate((list, tabLabel) => {
          const normalize = text => text?.replace(/\s+/g, ' ').trim() || '';
          for (const element of list.querySelectorAll('[role="tab"]')) {
            if (normalize(element.textContent).toLowerCase() !== tabLabel.toLowerCase()) continue;
            element.scrollIntoView({ block: 'nearest', inline: 'center' });
            return;
          }
        }, label)
        .catch(() => {});
    }
    await tab.scrollIntoViewIfNeeded({ timeout: 8000 }).catch(() => {});
    await expect(tab, `Tab "${label}" was not found.`).toBeAttached({ timeout: 30000 });
    const selected = (await tab.getAttribute('aria-selected')) === 'true';
    if (!selected) {
      await tab.click({ timeout: 15000 });
      let stillSelected = await tab.getAttribute('aria-selected').catch(() => null);
      if (stillSelected !== 'true') {
        await tab.click({ timeout: 5000, force: true }).catch(() => {});
      }
      await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 15000 });
    }

    if (options.setup) {
      await this.waitForSetupStep(`Opened tab: ${label}`);
      return;
    }

    await this.waitForReportSettle();
    await pauseForVisibility(this.reportsPage, `Opened tab: ${label}`);
  }

  async selectReport(step, options = {}) {
    await this.ensureControlTowerTabActive();

    const selectPassMs = SLOW_CT_REPORTS.has(step.name)
      ? Math.max(CT_VIEW_LOAD_MS, 90000)
      : Math.max(CT_VIEW_LOAD_MS, 60000);

    await expect(async () => {
      const combobox = await this.findVisibleIntelligenceCombobox();
      expect(combobox, `Combobox not found for "${step.name}".`).toBeTruthy();
      await this.selectComboboxOption(combobox, step.option);
    }).toPass({ timeout: selectPassMs });

    if (options.setup) {
      await this.waitForSetupStep(step.name);
      return;
    }

    await this.waitForViewLoaded(step.name);
  }

  async executeStep(step, options = {}) {
    if (step.type === 'managementTab') {
      await this.openManagementSection(step.label, options);
      return;
    }

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
}

module.exports = ControlTowerReportsPage;

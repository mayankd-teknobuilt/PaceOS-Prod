const ControlTowerReportsPage = require('./ControlTowerReportsPage');
const StageDashboardPage = require('../StageDashboardPage');
const logger = require('../../utils/logger');
const { portfolioUrl, CONTROL_TOWER_URL } = require('../../testdata/control-tower/shared');
const { getControlTowerDashboardMeta } = require('../../utils/controlTowerEnv');

class ControlTowerNavigationPage {
  constructor(dashboardPage) {
    this.dashboardPage = dashboardPage;
    this.reportsPage = new ControlTowerReportsPage(dashboardPage);
    this.controlTowerTab = null;
  }

  async openControlTowerFromDashboard(context, errorMonitor) {
    const dashboard = new StageDashboardPage(this.dashboardPage);
    const meta = getControlTowerDashboardMeta();

    logger.info(`Opening Control Tower via dashboard: ${meta.tabName} -> ${meta.moduleName}`);
    await dashboard.returnToDashboard(meta.tabName);

    const moduleCard = await dashboard.resolveModuleCard(meta);
    await moduleCard.waitFor({ state: 'visible', timeout: 30000 });

    const pageCountBefore = context.pages().length;
    await moduleCard.scrollIntoViewIfNeeded();
    await moduleCard.dblclick({ force: true });

    let ctPage = await dashboard.waitForModulePage(context, CONTROL_TOWER_URL, 60000);

    if (!ctPage) {
      const popupPromise = context.waitForEvent('page', { timeout: 15000 });
      await moduleCard.dblclick({ force: true });
      try {
        ctPage = await popupPromise;
      } catch {
        ctPage = null;
      }
    }

    if (!ctPage) {
      const pages = context.pages();
      if (pages.length > pageCountBefore) {
        for (let i = pages.length - 1; i >= pageCountBefore; i--) {
          if (CONTROL_TOWER_URL.test(pages[i].url())) {
            ctPage = pages[i];
            break;
          }
        }
        if (!ctPage) {
          ctPage = pages[pages.length - 1];
        }
      }
    }

    if (!ctPage) {
      try {
        await this.dashboardPage.waitForURL(CONTROL_TOWER_URL, { timeout: 30000 });
        ctPage = this.dashboardPage;
      } catch {
        ctPage = null;
      }
    }

    if (!ctPage) {
      logger.info('Control Tower tab not detected — opening portfolio URL on dashboard context');
      ctPage = this.dashboardPage;
      await ctPage.goto(portfolioUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else {
      await ctPage.bringToFront();
      await ctPage.waitForURL(CONTROL_TOWER_URL, { timeout: 60000 }).catch(async () => {
        await ctPage.goto(portfolioUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      });
    }

    if (!/#\/portfolio/i.test(ctPage.url())) {
      await ctPage.goto(portfolioUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    }

    return ctPage;
  }

  async openControlTower(context, errorMonitor) {
    if (this.controlTowerTab && !this.controlTowerTab.isClosed()) {
      logger.info('Reusing open Control Tower tab');
      await this.controlTowerTab.bringToFront();
      errorMonitor.attach(this.controlTowerTab);
      this.reportsPage.setReportsPage(this.controlTowerTab);

      if (!CONTROL_TOWER_URL.test(this.controlTowerTab.url())) {
        await this.controlTowerTab.goto(portfolioUrl, { waitUntil: 'domcontentloaded' });
      } else if (!/#\/portfolio/i.test(this.controlTowerTab.url())) {
        await this.controlTowerTab.goto(portfolioUrl, { waitUntil: 'domcontentloaded' });
      }

      await this.reportsPage.waitForControlTowerShell();
      await this.reportsPage.waitForPortfolioReady();
      errorMonitor.reset();
      await this.reportsPage.waitForReportSettle();
      errorMonitor.assertClean();
      return this.controlTowerTab;
    }

    logger.info('Opening Control Tower from dashboard');
    errorMonitor.reset();

    await this.dashboardPage.bringToFront();
    const ctPage = await this.openControlTowerFromDashboard(context, errorMonitor);
    await ctPage.bringToFront();

    this.controlTowerTab = ctPage;
    errorMonitor.attach(ctPage);
    this.reportsPage.setReportsPage(ctPage);

    await this.reportsPage.waitForControlTowerShell();
    await this.reportsPage.waitForPortfolioReady();
    errorMonitor.reset();
    await this.reportsPage.waitForReportSettle();
    errorMonitor.assertClean();
    return ctPage;
  }

  async navigateAllReports(context, errorMonitor, test) {
    await this.openControlTower(context, errorMonitor);
    await this.reportsPage.openAllReports(test, errorMonitor);
  }

  async closeControlTower() {
    if (this.controlTowerTab && !this.controlTowerTab.isClosed()) {
      await this.controlTowerTab.close();
      this.controlTowerTab = null;
    }

    await this.dashboardPage.bringToFront();
    const dashboard = new StageDashboardPage(this.dashboardPage);
    await dashboard.returnToDashboard();
  }
}

module.exports = ControlTowerNavigationPage;

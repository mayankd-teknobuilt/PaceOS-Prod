const ControlTowerReportsPage = require('./ControlTowerReportsPage');
const StageDashboardPage = require('../StageDashboardPage');
const logger = require('../../utils/logger');
const { portfolioUrl, CONTROL_TOWER_URL } = require('../../testdata/control-tower/shared');

const CONTROL_TOWER_TAB =
  process.env.PROD_CONTROL_TOWER_TAB?.trim() || 'Digital Control Tower';
const CONTROL_TOWER_MODULE =
  process.env.PROD_CONTROL_TOWER_MODULE?.trim() || 'Digital Control Tower';

class ControlTowerNavigationPage {
  constructor(dashboardPage) {
    this.dashboardPage = dashboardPage;
    this.reportsPage = new ControlTowerReportsPage(dashboardPage);
    this.controlTowerTab = null;
  }

  async openControlTowerFromDashboard(context, errorMonitor) {
    const dashboard = new StageDashboardPage(this.dashboardPage);
    await dashboard.returnToDashboard(CONTROL_TOWER_TAB);

    const moduleCard = dashboard.moduleCardLocator(CONTROL_TOWER_MODULE);
    await moduleCard.waitFor({ state: 'visible', timeout: 30000 });

    const popupPromise = context.waitForEvent('page', { timeout: 45000 });
    await moduleCard.dblclick({ force: true }).catch(async () => {
      await moduleCard.click({ force: true });
    });

    let ctPage = null;
    try {
      ctPage = await popupPromise;
    } catch {
      ctPage = null;
    }

    if (!ctPage) {
      logger.info('Control Tower popup not detected — opening portfolio URL directly');
      ctPage = await context.newPage();
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

    logger.info('Opening production Control Tower from dashboard');
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

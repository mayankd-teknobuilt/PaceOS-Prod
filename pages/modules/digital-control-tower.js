const { expect } = require('@playwright/test');
const ModuleBasePage = require('./ModuleBasePage');
const ControlTowerNavigationPage = require('../control-tower/ControlTowerNavigationPage');
const ControlTowerReportsPage = require('../control-tower/ControlTowerReportsPage');
const StageDashboardPage = require('../StageDashboardPage');
const { createErrorMonitor } = require('../../utils/moduleErrorMonitor');

class DigitalControlTowerPage extends ModuleBasePage {
  constructor(page) {
    super(page, 'Digital Control Tower', {
      urlPattern: /controltower|portfolio|us-controltower/i
    });
    this.readyMarker = /Trends\s*&\s*Analytics|Project Comparison|Control Room|portfolio/i;
  }

  async open(context) {
    const dashboard = new StageDashboardPage(this.page);

    if (!/dashboard/i.test(this.page.url())) {
      await dashboard.openDashboard();
    } else {
      await dashboard.dismissCookieBanner();
      await dashboard.waitForDashboardReady();
    }

    const navigation = new ControlTowerNavigationPage(this.page);
    const errorMonitor = createErrorMonitor();
    this.targetPage = await navigation.openControlTowerFromDashboard(context, errorMonitor);
    this.openedInNewTab = true;
    return this.targetPage;
  }

  async assertLoaded(targetPage = this.targetPage) {
    await expect(targetPage).toHaveURL(this.meta.urlPattern, { timeout: 60000 });

    const reportsPage = new ControlTowerReportsPage(targetPage);
    await reportsPage.waitForControlTowerShell();
    await reportsPage.waitForPortfolioReady();
    await expect(targetPage.locator('body')).toContainText(this.readyMarker, { timeout: 60000 });
  }

  async closeIfNewTab(dashboardPage = this.page) {
    if (this.targetPage && !this.targetPage.isClosed()) {
      await this.targetPage.close();
    }

    const dashboard = new StageDashboardPage(dashboardPage);
    await dashboard.returnToDashboard();
  }
}

module.exports = DigitalControlTowerPage;

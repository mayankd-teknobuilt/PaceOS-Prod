const { expect } = require('@playwright/test');
const ModuleBasePage = require('./ModuleBasePage');

class DigitalControlTowerPage extends ModuleBasePage {
  constructor(page) {
    super(page, 'Digital Control Tower', {
      urlPattern: /controltower|portfolio|us-controltower/i
    });
    this.readyMarker = /Trends\s*&\s*Analytics|Project Comparison|Control Room|portfolio/i;
  }

  async assertLoaded(targetPage = this.targetPage) {
    await expect(targetPage).toHaveURL(this.meta.urlPattern);
    await expect(targetPage.locator('body')).toContainText(this.readyMarker);
  }
}

module.exports = DigitalControlTowerPage;

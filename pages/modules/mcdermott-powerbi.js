const { expect } = require('@playwright/test');
const ModuleBasePage = require('./ModuleBasePage');

class McdermottPowerbiPage extends ModuleBasePage {
  constructor(page) {
    super(page, 'McDermott PowerBI', {
      urlPattern: /powerbi|app\.powerbi\.com|analysis\.windows\.net|pace-os\.com/i
    });
  }

  async assertLoaded(targetPage = this.targetPage) {
    await expect(targetPage.locator('body')).not.toBeEmpty({ timeout: 60000 });

    const frame = targetPage.frameLocator('iframe').first();
    const hasFrame = await frame.locator('body').count().catch(() => 0);
    if (hasFrame) {
      await expect(frame.locator('body')).not.toBeEmpty({ timeout: 60000 });
      return;
    }

    await expect(targetPage.locator('body')).toContainText(/power\s*bi|report|dashboard/i, {
      timeout: 60000
    });
  }
}

module.exports = McdermottPowerbiPage;

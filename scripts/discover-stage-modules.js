const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await page.waitForURL(/select-project|dashboard/i, { timeout: 30000 });
    await selectProdProjectContext(page);

    const dashboardUrl = page.url();
    const modules = [];
    const tabs = page.getByRole('tab');
    await tabs.first().waitFor({ state: 'visible', timeout: 30000 });
    const tabCount = await tabs.count();

    for (let tabIndex = 0; tabIndex < tabCount; tabIndex++) {
      await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
      const tab = tabs.nth(tabIndex);
      const tabName = (await tab.innerText()).trim().replace(/^PACE setting\s+/i, '');
      await tab.click({ force: true });
      await page.waitForTimeout(1000);

      const cards = page.locator('.cubeBox:not(.cubeBlank)');
      const moduleNames = await cards.evaluateAll(elements =>
        elements.map(
          card =>
            card.querySelector('.cubeInnerText p')?.textContent?.trim() ||
            card.textContent?.trim() ||
            'Unnamed module'
        )
      );

      moduleNames.forEach((moduleName, moduleIndex) => {
        modules.push({ tabIndex, tabName, moduleIndex, moduleName });
      });
    }

    console.log(JSON.stringify(modules, null, 2));
  } catch (error) {
    console.error('DISCOVERY_FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

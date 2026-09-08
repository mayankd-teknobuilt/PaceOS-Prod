const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local'), override: true });

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');

const routes = ['#/portfolio', '#/enterprise', '#/project-comparison', '#/advanced-analytics/gpx-powerbi'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();
  const errorMonitor = createErrorMonitor();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(validUser.email, validUser.password);
  await page.waitForURL(/select-project|dashboard/i, { timeout: 30000 });
  await selectProdProjectContext(page);

  const navigation = new ControlTowerNavigationPage(page);
  const ctPage = await navigation.openControlTower(context, errorMonitor);

  for (const route of routes) {
    await ctPage.goto(`https://us-controltower.pace-os.com/${route}`, { waitUntil: 'domcontentloaded' });
    await ctPage.waitForTimeout(4000);
    const body = await ctPage.locator('body').innerText();
    const hasProjectLibraries = /project libraries/i.test(body);
    const hasStandardLibraries = /standard libraries/i.test(body);
    const has3dScope = /3d scope matrix/i.test(body);
    const tabs = await ctPage.getByRole('tab').evaluateAll(elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    console.log(`\n${route}: tabs=${JSON.stringify(tabs)} projectLibraries=${hasProjectLibraries} standardLibraries=${hasStandardLibraries} 3dScope=${has3dScope}`);
  }

  await browser.close();
})();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local'), override: true });

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');

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
  await ctPage.goto(process.env.CONTROL_TOWER_PORTFOLIO_URL, { waitUntil: 'domcontentloaded' });
  await navigation.reportsPage.waitForControlTowerShell();
  await ctPage.getByText('Project Progress').first().waitFor({ state: 'visible', timeout: 60000 });

  async function listComboboxOptions(tabName) {
    await ctPage.getByRole('tab', { name: tabName }).click();
    await ctPage.waitForTimeout(2500);
    const combobox = await navigation.reportsPage.findVisibleIntelligenceCombobox();
    if (!combobox) {
      console.log(`\n${tabName}: no combobox`);
      return;
    }
    await combobox.click();
    await ctPage.waitForTimeout(1000);
    const options = await ctPage.getByRole('option').evaluateAll(elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    console.log(`\n${tabName} options (${options.length}):`);
    console.log(JSON.stringify(options, null, 2));
    await ctPage.keyboard.press('Escape');
  }

  for (const tab of ['Project Progress', 'Execution Overview', 'Health And Safety', 'JIM']) {
    await listComboboxOptions(tab);
  }

  await browser.close();
})();

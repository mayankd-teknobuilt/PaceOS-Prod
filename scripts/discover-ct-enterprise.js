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
  await ctPage.goto('https://us-controltower.pace-os.com/#/enterprise', { waitUntil: 'domcontentloaded' });
  await ctPage.waitForTimeout(5000);

  const tabs = await ctPage.getByRole('tab').evaluateAll(elements =>
    elements.map(el => el.textContent?.trim()).filter(Boolean)
  );
  console.log('Enterprise tabs:', JSON.stringify(tabs, null, 2));

  for (const tabName of tabs) {
    await ctPage.getByRole('tab', { name: tabName }).click();
    await ctPage.waitForTimeout(2000);
    const combobox = await navigation.reportsPage.findVisibleIntelligenceCombobox();
    if (!combobox) {
      console.log(`\n${tabName}: no combobox`);
      continue;
    }
    const label = await combobox.getAttribute('aria-label');
    await combobox.click();
    await ctPage.waitForTimeout(1000);
    const options = await ctPage.getByRole('option').evaluateAll(elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    console.log(`\n${tabName} (${label || 'no label'}) options (${options.length}):`);
    console.log(JSON.stringify(options.slice(0, 30), null, 2));
    if (options.length > 30) console.log(`... and ${options.length - 30} more`);
    await ctPage.keyboard.press('Escape');
  }

  await browser.close();
})();

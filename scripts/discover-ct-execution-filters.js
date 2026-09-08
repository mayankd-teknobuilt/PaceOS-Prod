const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local'), override: true });

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');

async function listOptions(ctPage, label) {
  const combobox = ctPage.locator('[role="combobox"]').filter({ hasNotText: /rows per page/i });
  const count = await combobox.count();
  for (let i = 0; i < count; i++) {
    const candidate = combobox.nth(i);
    if (!(await candidate.isVisible().catch(() => false))) continue;
    const aria = ((await candidate.getAttribute('aria-label')) || '').toLowerCase();
    if (aria.includes('rows per page')) continue;
    await candidate.click();
    await ctPage.waitForTimeout(1000);
    const options = await ctPage.getByRole('option').evaluateAll(elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    console.log(`\n${label} combobox #${i} options (${options.length}):`);
    console.log(JSON.stringify(options, null, 2));
    await ctPage.keyboard.press('Escape');
    return;
  }
  console.log(`\n${label}: no report combobox`);
}

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
  await ctPage.getByRole('tab', { name: 'Execution Overview' }).click();
  await ctPage.waitForTimeout(2000);

  await listOptions(ctPage, 'Execution Overview default');
  for (const filter of ['CWP', 'EWP', 'Stopped']) {
    const btn = ctPage.getByRole('button', { name: filter, exact: true });
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await ctPage.waitForTimeout(2000);
      await listOptions(ctPage, `After ${filter} filter`);
    }
  }

  await browser.close();
})();

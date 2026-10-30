const path = require('path');
const fs = require('fs');
const { loadProdEnv } = require('../utils/loadEnv');
const { getPaceEnvKey } = require('../utils/paceEnv');

loadProdEnv(path.resolve(__dirname, '..'));

const { chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const { getValidUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');
const { categories } = require('../testdata/control-tower');
const { buildReportTestCases } = require('../utils/controlTowerParallel');
const { isCategoryEnabledForEnv } = require('../utils/paceEnv');
const { getControlTowerDiscoveryTabs } = require('../testdata/control-tower/shared');

(async () => {
  const { email, password } = getValidUser();
  if (!email || !password) {
    console.error('Set TEST_EMAIL / TEST_PASSWORD for active PACE_ENV');
    process.exit(1);
  }

  console.log(`[discover-ct] PACE_ENV=${getPaceEnvKey()}`);
  console.log(`[discover-ct] module=${process.env.PROD_CONTROL_TOWER_MODULE} tab=${process.env.PROD_CONTROL_TOWER_TAB}`);

  const browser = await chromium.launch({ headless: process.env.PW_HEADED === 'true' ? false : true });
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();
  const errorMonitor = createErrorMonitor();

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);
  await selectProdProjectContext(page);

  const navigation = new ControlTowerNavigationPage(page);
  const ctPage = await navigation.openControlTower(context, errorMonitor);
  await ctPage.goto(process.env.CONTROL_TOWER_PORTFOLIO_URL, { waitUntil: 'domcontentloaded' });
  await navigation.reportsPage.waitForControlTowerShell();
  await navigation.reportsPage.waitForPortfolioReady();

  const discovered = {};

  async function listComboboxOptions(tabName) {
    await ctPage.getByRole('tab', { name: tabName }).click();
    await ctPage.waitForTimeout(2500);
    const combobox = await navigation.reportsPage.findVisibleIntelligenceCombobox();
    if (!combobox) {
      discovered[tabName] = [];
      console.log(`\n${tabName}: no combobox`);
      return;
    }
    await combobox.click();
    await ctPage.waitForTimeout(1000);
    const options = await ctPage.getByRole('option').evaluateAll(elements =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    discovered[tabName] = options;
    console.log(`\n${tabName} options (${options.length}):`);
    console.log(JSON.stringify(options, null, 2));
    await ctPage.keyboard.press('Escape');
  }

  for (const tab of getControlTowerDiscoveryTabs(getPaceEnvKey())) {
    await listComboboxOptions(tab);
  }

  const expected = [];
  for (const category of categories) {
    if (!isCategoryEnabledForEnv(category)) continue;
    for (const testCase of buildReportTestCases(category)) {
      expected.push(testCase.reportName);
    }
  }

  const discoveredFlat = [...new Set(Object.values(discovered).flat())];
  const missingInRegistry = discoveredFlat.filter(name => !expected.includes(name));
  const missingOnTenant = expected.filter(name => !discoveredFlat.includes(name));

  console.log('\n--- compare ---');
  console.log('Missing in test registry (add to control-tower categories):', missingInRegistry);
  console.log('In registry but not on tenant UI:', missingOnTenant);

  const outPath = path.resolve(__dirname, '..', 'testdata', `discovered-${getPaceEnvKey()}-ct-reports.json`);
  fs.writeFileSync(
    outPath,
    `${JSON.stringify({ discovered, missingInRegistry, missingOnTenant, expectedCount: expected.length }, null, 2)}\n`,
    'utf8'
  );
  console.log(`[discover-ct] wrote ${outPath}`);

  await browser.close();
})().catch(error => {
  console.error('DISCOVERY_FAILED:', error.message);
  process.exitCode = 1;
});

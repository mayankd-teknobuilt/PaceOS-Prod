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
const {
  collectAllListboxOptions,
  listControlTowerTabLabels,
  discoverIndicatorsWithManagementSections,
  collectVisibleComboboxOptions,
  resolvePortfolioTabList,
  openPortfolioTab
} = require('../utils/discoverCtListbox');
const { countDiscoveryTestCases, flattenDiscoveryTab } = require('../utils/ctManagementSections');

const INDICATORS_TABS = new Set(['Leading Indicators', 'Lagging Indicators']);

(async () => {
  const { email, password } = getValidUser();
  if (!email || !password) {
    console.error('Set TEST_EMAIL / TEST_PASSWORD for active PACE_ENV');
    process.exit(1);
  }

  console.log(`[discover-ct] PACE_ENV=${getPaceEnvKey()}`);
  console.log(`[discover-ct] module=${process.env.PROD_CONTROL_TOWER_MODULE} tab=${process.env.PROD_CONTROL_TOWER_TAB}`);

  const browser = await chromium.launch({ headless: process.env.PW_HEADED === 'true' ? false : true });
  const context = await browser.newContext({ baseURL: process.env.BASE_URL, acceptDownloads: true });
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

  const portfolioLabels = await (await resolvePortfolioTabList(ctPage))
    .getByRole('tab')
    .allTextContents();
  console.log('[discover-ct] portfolio tab labels:', portfolioLabels.map(t => t.replace(/\s+/g, ' ').trim()));

  const uiTabs = await listControlTowerTabLabels(ctPage);
  const configuredTabs = getControlTowerDiscoveryTabs(getPaceEnvKey());
  const tabsToScan = [...new Set([...configuredTabs, ...uiTabs])].sort((a, b) => {
    const order = { 'Lagging Indicators': 0, 'Leading Indicators': 1 };
    return (order[a] ?? 10) - (order[b] ?? 10);
  });

  console.log(`[discover-ct] UI tabs (${uiTabs.length}):`, uiTabs);
  console.log(`[discover-ct] Scanning ${tabsToScan.length} tab(s)`);

  const discovered = {};

  async function listComboboxOptions(tabName) {
    try {
      await openPortfolioTab(ctPage, tabName);
    } catch {
      discovered[tabName] = [];
      console.log(`\n${tabName}: tab not found`);
      return;
    }

    await ctPage.waitForTimeout(2000);
    await navigation.reportsPage.dismissOpenMenus().catch(() => {});

    if (INDICATORS_TABS.has(tabName)) {
      discovered[tabName] = await discoverIndicatorsWithManagementSections(
        ctPage,
        navigation.reportsPage,
        tabName
      );
      const rows = flattenDiscoveryTab(discovered[tabName]);
      console.log(`\n${tabName} sections (${rows.length} test cases):`);
      console.log(JSON.stringify(discovered[tabName], null, 2));
      return;
    }

    const combobox = await navigation.reportsPage.findVisibleIntelligenceCombobox();
    if (!combobox) {
      const comboCount = await ctPage.getByRole('combobox').count();
      const merged = new Set();
      for (let i = 0; i < comboCount; i++) {
        const candidate = ctPage.getByRole('combobox').nth(i);
        if (!(await candidate.isVisible().catch(() => false))) continue;
        const ariaLabel = ((await candidate.getAttribute('aria-label')) || '').toLowerCase();
        const text = ((await candidate.textContent()) || '').toLowerCase();
        if (ariaLabel.includes('rows per page') || text.includes('rows per page')) continue;
        const opts = await collectAllListboxOptions(ctPage, candidate);
        opts.forEach(opt => merged.add(opt));
      }
      discovered[tabName] = [...merged].sort((a, b) => a.localeCompare(b));
      console.log(`\n${tabName} options (${discovered[tabName].length}) [fallback combobox scan]:`);
      console.log(JSON.stringify(discovered[tabName], null, 2));
      return;
    }

    const options = await collectAllListboxOptions(ctPage, combobox);
    discovered[tabName] = options;
    console.log(`\n${tabName} options (${options.length}):`);
    console.log(JSON.stringify(options, null, 2));
  }

  for (const tab of tabsToScan) {
    await listComboboxOptions(tab);
  }

  const expected = [];
  for (const category of categories) {
    if (!isCategoryEnabledForEnv(category)) continue;
    for (const testCase of buildReportTestCases(category)) {
      expected.push(testCase.reportName);
    }
  }

  const discoveredFlat = [...new Set(
    Object.values(discovered).flatMap(value => flattenDiscoveryTab(value).map(row => row.name))
  )];
  const discoveredTestCaseCount = countDiscoveryTestCases(discovered);
  const missingInRegistry = discoveredFlat.filter(name => !expected.includes(name));
  const missingOnTenant = expected.filter(name => !discoveredFlat.includes(name));

  console.log('\n--- compare ---');
  console.log('Discovered unique report names:', discoveredFlat.length);
  console.log('Discovered test cases (per tab, incl. duplicates):', discoveredTestCaseCount);
  console.log('Registry report total:', expected.length);
  console.log('Missing in test registry (add to control-tower categories):', missingInRegistry);
  console.log('In registry but not on tenant UI:', missingOnTenant);

  const outPath = path.resolve(__dirname, '..', 'testdata', `discovered-${getPaceEnvKey()}-ct-reports.json`);
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        discovered,
        uiTabs,
        missingInRegistry,
        missingOnTenant,
        discoveredUniqueCount: discoveredFlat.length,
        discoveredTestCaseCount,
        registryCount: expected.length
      },
      null,
      2
    )}\n`,
    'utf8'
  );
  console.log(`[discover-ct] wrote ${outPath}`);

  await browser.close();
})().catch(error => {
  console.error('DISCOVERY_FAILED:', error.message);
  process.exitCode = 1;
});

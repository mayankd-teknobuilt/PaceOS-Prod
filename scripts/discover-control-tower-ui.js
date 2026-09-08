const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');
const StageDashboardPage = require('../pages/StageDashboardPage');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('../utils/moduleErrorMonitor');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();
  const errorMonitor = createErrorMonitor();

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await page.waitForURL(/select-project|dashboard/i, { timeout: 30000 });
    await selectProdProjectContext(page);

    const dashboard = new StageDashboardPage(page);
    await dashboard.returnToDashboard();

    const navigation = new ControlTowerNavigationPage(page);
    const ctPage = await navigation.openControlTower(context, errorMonitor);
    await navigation.reportsPage.waitForControlTowerShell();

    if (!(await ctPage.getByRole('tab').first().isVisible().catch(() => false))) {
      await ctPage.goto(process.env.CONTROL_TOWER_PORTFOLIO_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await navigation.reportsPage.waitForControlTowerShell();
      await ctPage.waitForTimeout(3000);
    }

    await ctPage.getByText('Project Progress', { exact: false }).first().waitFor({
      state: 'visible',
      timeout: 60000
    }).catch(() => {});

    const dump = async label => {
      const tabs = await ctPage.getByRole('tab').evaluateAll(elements =>
        elements.map(el => ({
          name: el.textContent?.trim(),
          selected: el.getAttribute('aria-selected')
        }))
      );

      const buttons = await ctPage.getByRole('button').evaluateAll(elements =>
        elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 1 && text.length < 80)
      );

      const links = await ctPage.getByRole('link').evaluateAll(elements =>
        elements
          .map(el => ({ text: el.textContent?.trim(), href: el.getAttribute('href') }))
          .filter(item => item.text && item.text.length < 80)
      );

      console.log(`\n=== ${label} ===`);
      console.log('URL:', ctPage.url());
      console.log('TABS:', JSON.stringify(tabs, null, 2));
      console.log('BUTTONS:', JSON.stringify([...new Set(buttons)], null, 2));
      console.log('LINKS:', JSON.stringify(links.slice(0, 30), null, 2));
    };

    await dump('Initial portfolio view');

    const mainTabs = ctPage.getByRole('tab');
    const tabCount = await mainTabs.count();
    for (let i = 0; i < tabCount; i++) {
      const tab = mainTabs.nth(i);
      const tabName = (await tab.innerText()).trim();
      await tab.click();
      await ctPage.waitForTimeout(1500);
      await dump(`Main tab: ${tabName}`);
    }

    for (const label of expandable) {
      const btn = ctPage.getByRole('button', { name: new RegExp(label, 'i') }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await ctPage.waitForTimeout(1000);
        await dump(`Expanded: ${label}`);
      }
    }

    const execTab = ctPage.getByRole('tab', { name: 'Execution Overview' });
    if (await execTab.isVisible().catch(() => false)) {
      await execTab.click();
      await ctPage.waitForTimeout(2000);
      const combobox = await navigation.reportsPage.findVisibleIntelligenceCombobox();
      if (combobox) {
        await combobox.click();
        await ctPage.waitForTimeout(1000);
        const options = await ctPage.getByRole('option').evaluateAll(elements =>
          elements.map(el => el.textContent?.trim()).filter(Boolean)
        );
        console.log('\n=== Execution Overview report options ===');
        console.log(JSON.stringify(options, null, 2));
        await ctPage.keyboard.press('Escape');
      } else {
        console.log('\n=== Execution Overview: no intelligence combobox found ===');
      }
    }

    const projectButton = ctPage.getByRole('button', { name: /^Training$|control tower/i }).first();
    if (await projectButton.isVisible().catch(() => false)) {
      console.log('\n=== Project selector ===');
      await projectButton.click();
      await ctPage.waitForTimeout(1000);
      const options = await ctPage.getByRole('option').evaluateAll(elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      );
      const menuItems = await ctPage.getByRole('menuitem').evaluateAll(elements =>
        elements.map(el => el.textContent?.trim()).filter(Boolean)
      );
      console.log('OPTIONS:', JSON.stringify(options, null, 2));
      console.log('MENU ITEMS:', JSON.stringify(menuItems, null, 2));
      await ctPage.keyboard.press('Escape');
    }
  } catch (error) {
    console.error('DISCOVERY_FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

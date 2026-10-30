const fs = require('fs');
const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');
const { getPaceEnvKey, getEnvironmentProfile } = require('../utils/paceEnv');

loadProdEnv(path.resolve(__dirname, '..'));

const { chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const { getValidUser } = require('../testdata/loginData');
const { selectProdProjectContext } = require('../utils/prodProjectContext');

(async () => {
  const profile = getEnvironmentProfile();
  const { email, password } = getValidUser();
  if (!email || !password) {
    console.error('Set TEST_EMAIL and TEST_PASSWORD for the active PACE_ENV.');
    process.exit(1);
  }

  console.log(`[discover-modules] PACE_ENV=${getPaceEnvKey()} (${profile.label})`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ baseURL: process.env.BASE_URL });

  try {
    const loginPage = new LoginPage(page);
    await loginPage.login(email, password);
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

    const outPath = path.resolve(__dirname, '..', 'testdata', `discovered-${getPaceEnvKey()}-modules.json`);
    fs.writeFileSync(outPath, `${JSON.stringify(modules, null, 2)}\n`, 'utf8');
    console.log(`[discover-modules] wrote ${outPath}`);
    console.log(JSON.stringify(modules, null, 2));
  } catch (error) {
    console.error('DISCOVERY_FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

const { chromium } = require('playwright');
const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const ProjectPage = require('../pages/ProjectPage');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(validUser.email, validUser.password);
    await page.waitForURL(/select-project|dashboard/i, { timeout: 30000 });

    if (!/select-project/i.test(page.url())) {
      await page.goto(new URL('/select-project', process.env.BASE_URL).toString(), {
        waitUntil: 'domcontentloaded'
      });
    }

    const projectPage = new ProjectPage(page);
    await projectPage.selectFirstProject();
    await page.waitForTimeout(1000);

    const phases = await page.getByRole('button').evaluateAll(buttons =>
      buttons
        .map(btn => btn.textContent?.trim())
        .filter(text => text && text.length > 2)
    );

    console.log('PHASES:', JSON.stringify(phases, null, 2));

    if (phases.length > 0) {
      const firstPhase = phases.find(p => p.includes('Process Train')) || phases[0];
      await projectPage.selectModule(firstPhase);
      await page.waitForTimeout(1000);

      const sections = await page.getByRole('button').evaluateAll(buttons =>
        buttons
          .map(btn => btn.textContent?.trim())
          .filter(text => text && text.length > 1)
      );

      console.log(`SECTIONS (after phase "${firstPhase}"):`, JSON.stringify(sections, null, 2));

      const sectionButtons = page.getByRole('button');
      const sectionCount = await sectionButtons.count();
      const sectionNames = [];
      for (let i = 0; i < sectionCount; i++) {
        const text = (await sectionButtons.nth(i).innerText()).trim();
        if (text && !text.includes('Continue') && text !== firstPhase) {
          sectionNames.push(text);
        }
      }

      if (sectionNames.length > 0) {
        const firstSection = sectionNames[0];
        await projectPage.selectSubModule(firstSection);
        await page.waitForTimeout(1000);

        const blocks = await page.getByRole('radio').evaluateAll(radios =>
          radios.map(r => r.getAttribute('aria-label') || r.textContent?.trim()).filter(Boolean)
        );

        if (blocks.length === 0) {
          const blockTexts = await page.locator('label, [role="radio"]').evaluateAll(els =>
            els.map(el => el.textContent?.trim()).filter(text => text && text.length > 3)
          );
          console.log(`BLOCKS (after section "${firstSection}"):`, JSON.stringify(blockTexts, null, 2));
        } else {
          console.log(`BLOCKS (after section "${firstSection}"):`, JSON.stringify(blocks, null, 2));
        }
      }
    }

    const tabs = page.getByRole('tab');
    if (await tabs.first().isVisible().catch(() => false)) {
      const dashboardUrl = page.url();
      const modules = [];
      const tabCount = await tabs.count();

      for (let tabIndex = 0; tabIndex < tabCount; tabIndex++) {
        await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
        const tab = tabs.nth(tabIndex);
        const tabName = (await tab.innerText()).trim().replace(/^PACE setting\s+/i, '');
        await tab.click({ force: true });
        await page.waitForTimeout(1000);

        const moduleNames = await page.locator('.cubeBox:not(.cubeBlank)').evaluateAll(elements =>
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

      console.log('MODULES:', JSON.stringify(modules, null, 2));
    }
  } catch (error) {
    console.error('DISCOVERY_FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

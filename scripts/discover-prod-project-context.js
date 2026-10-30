const path = require('path');
const { loadProdEnv } = require('../utils/loadEnv');
const { getPaceEnvKey, getEnvironmentProfile } = require('../utils/paceEnv');

loadProdEnv(path.resolve(__dirname, '..'));

const { chromium } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');
const ProjectPage = require('../pages/ProjectPage');

function pickEnvCredentials() {
  return {
    email: process.env.TEST_EMAIL?.trim(),
    password: process.env.TEST_PASSWORD?.trim()
  };
}

async function listProjectNames(page) {
  const projectPage = new ProjectPage(page);
  await projectPage.dismissCookieBanner();

  const selectors = ['.MuiCardMedia-root', '.MuiCard-root', '[class*="ProjectCard"]'];
  for (const selector of selectors) {
    const cards = page.locator(selector);
    const count = await cards.count();
    if (!count) continue;

    const names = [];
    for (let i = 0; i < count; i++) {
      const text = (await cards.nth(i).innerText()).trim().split('\n').map(l => l.trim()).filter(Boolean);
      const title = text.find(line => line.length > 2) || text[0];
      if (title) names.push(title);
    }
    if (names.length) return [...new Set(names)];
  }
  return [];
}

(async () => {
  const profile = getEnvironmentProfile();
  const { email, password } = pickEnvCredentials();
  if (!email || !password) {
    console.error('Set TEST_EMAIL and TEST_PASSWORD (e.g. .env.dev3.local for dev3).');
    process.exit(1);
  }

  console.log(`[discover] PACE_ENV=${getPaceEnvKey()} (${profile.label})`);
  console.log(`[discover] BASE_URL=${process.env.BASE_URL}`);

  const browser = await chromium.launch({ headless: process.env.PW_HEADED === 'true' ? false : true });
  const page = await browser.newPage({ baseURL: process.env.BASE_URL });

  try {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await page.waitForURL(/select-project|dashboard/i, { timeout: 60000 });

    if (!/select-project/i.test(page.url())) {
      await page.goto('/select-project', { waitUntil: 'domcontentloaded' });
    }

    const projectNames = await listProjectNames(page);
    console.log('PROJECTS:', JSON.stringify(projectNames, null, 2));

    const projectPage = new ProjectPage(page);
    const cardIndex = Number(process.env.PROD_PROJECT_CARD_INDEX || 0);
    const targetProject = process.env.PROD_PROJECT_NAME?.trim();
    if (cardIndex > 0) {
      console.log(`[discover] Selecting PROD_PROJECT_CARD_INDEX=${cardIndex}`);
      await projectPage.selectProjectByCardIndex(cardIndex);
    } else if (targetProject) {
      console.log(`[discover] Selecting PROD_PROJECT_NAME=${targetProject}`);
      await projectPage.selectProject(targetProject);
    } else {
      console.log('[discover] Selecting first project (PROD_USE_FIRST_PROJECT / no name)');
      await projectPage.selectFirstProject();
    }
    await page.waitForTimeout(1000);

    const phases = await page.getByRole('button').evaluateAll(buttons =>
      buttons
        .map(btn => btn.textContent?.trim())
        .filter(text => text && text.length > 2 && !/^continue$/i.test(text))
    );

    console.log('PHASES:', JSON.stringify(phases, null, 2));

    const configuredPhase = process.env.PROD_PHASE?.trim();
    const firstPhase =
      (configuredPhase && phases.find(p => p === configuredPhase)) ||
      phases.find(p => p.includes('Process Train')) ||
      phases[0];

    if (!firstPhase) {
      console.log('No phases found — project may open dashboard directly.');
    } else {
      await projectPage.selectModule(firstPhase);
      await page.waitForTimeout(1000);

      const sectionButtons = page.getByRole('button');
      const sectionCount = await sectionButtons.count();
      const sectionNames = [];
      for (let i = 0; i < sectionCount; i++) {
        const text = (await sectionButtons.nth(i).innerText()).trim();
        if (text && !/^continue$/i.test(text) && text !== firstPhase) {
          sectionNames.push(text);
        }
      }

      console.log(`SECTIONS (after phase "${firstPhase}"):`, JSON.stringify(sectionNames, null, 2));

      const configuredSection = process.env.PROD_SECTION?.trim();
      const firstSection =
        (configuredSection && sectionNames.find(s => s === configuredSection)) || sectionNames[0];

      if (firstSection) {
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

        console.log('');
        console.log('Suggested env for config/environments.js or .env.*.local:');
        if (targetProject) console.log(`  PROD_PROJECT_NAME=${targetProject}`);
        console.log(`  PROD_PHASE=${firstPhase}`);
        if (firstSection) console.log(`  PROD_SECTION=${firstSection}`);
        const blockList = blocks.length ? blocks : [];
        if (blockList[0]) console.log(`  PROD_BLOCK=${blockList[0]}`);
      }
    }
  } catch (error) {
    console.error('DISCOVERY_FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

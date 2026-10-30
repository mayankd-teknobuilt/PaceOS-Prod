const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');
const { loadProdEnv } = require('./utils/loadEnv');
const { performLogin, hasValidSession } = require('./utils/prodAuth');
const { selectProdProjectContext } = require('./utils/prodProjectContext');
const {
  getAuthDir,
  getAuthStoragePath,
  seedWorkerAuthStores
} = require('./utils/authStorage');
const { getEnvironmentProfile, getPaceEnvKey } = require('./utils/paceEnv');
const { applyControlTowerCiDefaults } = require('./utils/ciControlTower');
const { applyModulesCiDefaults } = require('./utils/ciModules');

loadProdEnv();
applyControlTowerCiDefaults();
applyModulesCiDefaults();

function launchHeadless() {
  if (process.env.PW_HEADED === 'true') return false;
  if (process.env.PW_HEADLESS === 'false') return false;
  if (process.argv.includes('--headed')) return false;
  return !!process.env.CI;
}

async function createBrowserSession(baseUrl) {
  const browser = await chromium.launch({ headless: launchHeadless() });
  const context = await browser.newContext({
    baseURL: baseUrl,
    acceptDownloads: true
  });
  const page = await context.newPage();
  return { browser, context, page };
}

async function createAuthState(loginMethod) {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
  }

  const storagePath = getAuthStoragePath(loginMethod);
  let { browser, context, page } = await createBrowserSession(baseUrl);

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[global-setup] Authenticating (${loginMethod}), attempt ${attempt}`);

      if (attempt > 1) {
        await browser.close().catch(() => {});
        ({ browser, context, page } = await createBrowserSession(baseUrl));
      }

      const needsLogin = !(await hasValidSession(page));
      if (needsLogin) {
        await performLogin(page, loginMethod);
      } else if (!/\/select-project/i.test(page.url())) {
        await page.goto(new URL('/select-project', baseUrl).toString(), {
          waitUntil: 'domcontentloaded'
        });
      }

      await selectProdProjectContext(page);
      await context.storageState({ path: storagePath });
      console.log(`[global-setup] Saved auth state: ${storagePath}`);
      await browser.close();
      return;
    } catch (error) {
      lastError = error;
      console.warn(`[global-setup] Attempt ${attempt} failed for ${loginMethod}: ${error.message}`);
    }
  }

  await browser.close().catch(() => {});
  throw lastError;
}

module.exports = async function globalSetup() {
  loadProdEnv();
  applyControlTowerCiDefaults();
  applyModulesCiDefaults();

  fs.mkdirSync(getAuthDir(), { recursive: true });

  const workers = Number(process.env.PLAYWRIGHT_WORKERS || process.env.WORKERS) || 4;
  const profile = getEnvironmentProfile();
  const moduleMode =
    workers === 1 ? 'serial (each spec)' : 'parallel (each spec)';
  console.log(
    `[global-setup] env=${getPaceEnvKey()} (${profile.label}), workers=${workers}, module mode=${moduleMode}`
  );
  console.log(`[global-setup] BASE_URL=${process.env.BASE_URL}`);

  const tasks = [createAuthState('credentials')];

  const includeBadge =
    process.env.INCLUDE_BADGE_AUTH === 'true' &&
    process.env.BADGE_NUMBER &&
    (process.env.BADGE_PASSWORD || process.env.TEST_PASSWORD);

  if (includeBadge) {
    tasks.push(createAuthState('badge'));
  } else {
    console.warn('[global-setup] Skipping badge auth (set INCLUDE_BADGE_AUTH=true for badge projects)');
  }

  await Promise.all(tasks);

  const seedCount = workers + 4;
  seedWorkerAuthStores(seedCount, ['credentials']);
  if (includeBadge) {
    seedWorkerAuthStores(seedCount, ['badge']);
  }
  console.log(`[global-setup] Seeded worker auth files 0..${seedCount - 1}`);
};

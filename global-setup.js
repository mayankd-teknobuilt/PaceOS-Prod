const path = require('path');
const fs = require('fs');
const { chromium } = require('@playwright/test');

const envPath = path.resolve(__dirname, '.env.local');
require('dotenv').config({ path: envPath, override: true });

const { performLogin } = require('./utils/prodAuth');
const { selectProdProjectContext } = require('./utils/prodProjectContext');
const { AUTH_DIR, getAuthStoragePath } = require('./utils/authStorage');

async function createAuthState(loginMethod) {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
  }

  const storagePath = getAuthStoragePath(loginMethod);
  const browser = await chromium.launch({
    headless: process.env.PW_HEADED === 'true' ? false : true
  });
  const context = await browser.newContext({
    baseURL: baseUrl,
    acceptDownloads: true
  });
  const page = await context.newPage();

  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[global-setup] Authenticating (${loginMethod}), attempt ${attempt}`);
      await performLogin(page, loginMethod);
      await selectProdProjectContext(page);
      await context.storageState({ path: storagePath });
      console.log(`[global-setup] Saved auth state: ${storagePath}`);
      await browser.close();
      return;
    } catch (error) {
      lastError = error;
      console.warn(`[global-setup] Attempt ${attempt} failed for ${loginMethod}: ${error.message}`);
      if (attempt < 2) {
        await page.waitForTimeout(1500);
      }
    }
  }

  await browser.close();
  throw lastError;
}

module.exports = async function globalSetup() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  const tasks = [createAuthState('credentials')];

  const includeBadge =
    process.env.INCLUDE_BADGE_AUTH === 'true' &&
    process.env.BADGE_NUMBER &&
    process.env.BADGE_PASSWORD;

  if (includeBadge) {
    tasks.push(createAuthState('badge'));
  } else {
    console.warn('[global-setup] Skipping badge auth (set INCLUDE_BADGE_AUTH=true for badge projects)');
  }

  await Promise.all(tasks);
};

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

const LoginPage = require('../pages/LoginPage');
const { validUser } = require('../testdata/loginData');
const logger = require('./logger');

const AUTHENTICATED_PATH = /\/(dashboard|select-project|my-work|project-list|users)/i;

async function dismissCookieBanner(page) {
  const cookieBtn = page.getByRole('button', { name: 'I understand' });
  if (await cookieBtn.isVisible().catch(() => false)) {
    logger.info('Dismissing cookie banner');
    await cookieBtn.click({ force: true });
    await cookieBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

async function isLoginVisible(page) {
  return page
    .locator(
      'input[name="emailPhone"], input[name="email"], input[placeholder*="Email / Mobile number" i]'
    )
    .first()
    .isVisible()
    .catch(() => false);
}

async function isDashboardReady(page) {
  if (!/\/dashboard/i.test(page.url())) return false;
  return page.getByRole('tab').first().isVisible().catch(() => false);
}

async function hasValidSession(page) {
  if (await isDashboardReady(page)) return true;
  if (!AUTHENTICATED_PATH.test(page.url())) return false;
  return !(await isLoginVisible(page));
}

/**
 * Logs in via email/password or badge number, based on loginMethod.
 * loginMethod: 'credentials' (default) | 'badge'
 */
async function performLogin(page, loginMethod = 'credentials') {
  const loginPage = new LoginPage(page);

  if (!(await isLoginVisible(page))) {
    await loginPage.goto();
  } else {
    logger.info('Login form already visible — skipping home reload');
  }

  if (loginMethod === 'badge') {
    const badgeNumber = process.env.BADGE_NUMBER;
    const badgePassword = process.env.BADGE_PASSWORD;

    if (!badgeNumber || !badgePassword) {
      throw new Error('loginMethod=badge but BADGE_NUMBER/BADGE_PASSWORD is missing in .env.local');
    }

    logger.info('Production login (single session) — via Badge Number');
    await loginPage.loginWithBadge(badgeNumber, badgePassword);
  } else {
    logger.info('Production login (single session) — via Email/Password');
    await loginPage.login(validUser.email, validUser.password);
  }

  await page.waitForURL(/select-project|dashboard|my-work/i, { timeout: 30000 });
}

async function ensureProdSession(page, loginMethod = 'credentials') {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
  }

  if (await hasValidSession(page)) return;

  for (const route of ['/dashboard', '/select-project', '/my-work']) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
    if (await hasValidSession(page)) return;
    if (await isLoginVisible(page)) {
      await performLogin(page, loginMethod);
      return;
    }
  }

  await performLogin(page, loginMethod);
}

module.exports = {
  ensureProdSession,
  performLogin,
  dismissCookieBanner,
  isDashboardReady,
  hasValidSession,
  isLoginVisible
};
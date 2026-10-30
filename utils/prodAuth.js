const LoginPage = require('../pages/LoginPage');
const { getValidUser } = require('../testdata/loginData');
const { AUTHENTICATED_URL, isLoginFormVisible, waitForAuthenticated } = require('./loginSession');
const { safeGoto } = require('./safeNavigation');
const logger = require('./logger');

async function dismissCookieBanner(page) {
  const cookieBtn = page.getByRole('button', { name: 'I understand' });
  if (await cookieBtn.isVisible().catch(() => false)) {
    logger.info('Dismissing cookie banner');
    await cookieBtn.click({ force: true });
    await cookieBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }
}

async function isLoginVisible(page) {
  return isLoginFormVisible(page);
}

async function isDashboardReady(page) {
  if (!/\/dashboard/i.test(page.url())) return false;
  return page.getByRole('tab').first().isVisible().catch(() => false);
}

async function hasValidSession(page) {
  if (await isDashboardReady(page)) return true;
  if (!AUTHENTICATED_URL.test(page.url())) return false;
  return !(await isLoginVisible(page));
}

/**
 * Logs in via email/password or badge number, based on loginMethod.
 * loginMethod: 'credentials' (default) | 'badge'
 */
async function performLogin(page, loginMethod = 'credentials') {
  const loginPage = new LoginPage(page);

  if (loginMethod === 'badge') {
    const badgeNumber = process.env.BADGE_NUMBER;
    const badgePassword = process.env.BADGE_PASSWORD || process.env.TEST_PASSWORD;

    if (!badgeNumber || !badgePassword) {
      throw new Error(
        'loginMethod=badge but BADGE_NUMBER and password are missing. Set BADGE_NUMBER and BADGE_PASSWORD (or TEST_PASSWORD) in .env.local'
      );
    }

    logger.info('Production login (single session) — via Badge Number');
    await loginPage.loginWithBadge(badgeNumber, badgePassword);
  } else {
    const { email, password } = getValidUser();
    if (!email || !password) {
      throw new Error('TEST_EMAIL and TEST_PASSWORD are required. Set them in .env.local or .env.<PACE_ENV>.local');
    }
    logger.info(`Production login (single session) — via Email/Password (${email})`);
    await loginPage.login(email, password);
  }

  await waitForAuthenticated(page, { timeoutMs: 30000 });
}

async function ensureProdSession(page, loginMethod = 'credentials') {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
  }

  if (await hasValidSession(page)) return;

  for (const route of ['/dashboard', '/select-project', '/my-work']) {
    await safeGoto(page, new URL(route, baseUrl).toString());
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
const StageDashboardPage = require('../pages/StageDashboardPage');
const {
  performLogin,
  hasValidSession,
  dismissCookieBanner,
  isLoginVisible
} = require('./prodAuth');
const { selectProdProjectContext, isProjectContextSet } = require('./prodProjectContext');
const logger = require('./logger');

/**
 * Restore an authenticated dashboard session from saved storage state.
 * Only performs a fresh login when the login form is actually visible.
 */
async function bootstrapProdSession(page, loginMethod, baseUrl) {
  const dashboard = new StageDashboardPage(page);

  for (const route of ['/dashboard', '/my-work']) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    if (await isLoginVisible(page)) {
      break;
    }

    if (/dashboard/i.test(page.url())) {
      try {
        await dashboard.waitForDashboardReady();
      } catch {
        continue;
      }

      if (await isProjectContextSet(page)) {
        return;
      }
    }
  }

  if (await isLoginVisible(page)) {
    logger.warn('Saved auth is not active — logging in for this worker');
    await performLogin(page, loginMethod);
  } else if (!(await hasValidSession(page))) {
    await page.goto(new URL('/dashboard', baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);
  }

  if (!(await isProjectContextSet(page))) {
    await selectProdProjectContext(page);
  }

  await dashboard.returnToDashboard();
}

module.exports = { bootstrapProdSession };

const path = require('path');
const StageDashboardPage = require('../pages/StageDashboardPage');
const {
  performLogin,
  hasValidSession,
  dismissCookieBanner,
  isLoginVisible,
  isDashboardReady
} = require('./prodAuth');
const { selectProdProjectContext, isProjectContextSet } = require('./prodProjectContext');
const { withLoginLock } = require('./authLock');
const { getAuthStoragePath } = require('./authStorage');
const { safeGoto } = require('./safeNavigation');
const logger = require('./logger');

async function assertAuthenticatedDashboard(page, workerLabel = 'worker') {
  if (await isLoginVisible(page)) {
    throw new Error(`${workerLabel} is not authenticated (login form visible).`);
  }

  if (!(await isDashboardReady(page))) {
    throw new Error(`${workerLabel} dashboard is not ready. URL=${page.url()}`);
  }

  if (!(await isProjectContextSet(page))) {
    throw new Error(`${workerLabel} is missing production project context.`);
  }
}

async function tryRestoreDashboardSession(page, baseUrl, workerLabel) {
  const dashboard = new StageDashboardPage(page);
  const dashboardUrl = new URL('/dashboard', baseUrl).toString();

  for (const route of [dashboardUrl, new URL('/my-work', baseUrl).toString()]) {
    if (page.isClosed()) {
      return false;
    }

    await safeGoto(page, route);
    await dismissCookieBanner(page);

    if (await isLoginVisible(page)) {
      return false;
    }

    if (!/dashboard/i.test(page.url())) {
      continue;
    }

    if (!(await hasValidSession(page))) {
      continue;
    }

    if (!(await isProjectContextSet(page))) {
      continue;
    }

    await dashboard.assertDashboardStable();
    logger.info(`${workerLabel}: reused saved auth session (no login)`);
    return true;
  }

  return false;
}

/**
 * One login + project context per worker. Uses global-setup storage; login lock only when restore fails.
 */
async function bootstrapProdSession(page, loginMethod, baseUrl, workerIndex = 0) {
  const workerLabel = `Worker ${workerIndex}`;
  const storagePath = getAuthStoragePath(loginMethod, workerIndex);
  let authenticatedOnCurrentPage = false;

  if (await tryRestoreDashboardSession(page, baseUrl, workerLabel)) {
    return page;
  }

  await withLoginLock(workerLabel, async () => {
    if (await tryRestoreDashboardSession(page, baseUrl, workerLabel)) {
      authenticatedOnCurrentPage = true;
      return;
    }

    logger.info(`${workerLabel}: logging in (${loginMethod})`);
    if (await isLoginVisible(page) || !(await hasValidSession(page))) {
      await performLogin(page, loginMethod);
    }

    if (!(await isProjectContextSet(page))) {
      await selectProdProjectContext(page);
    }

    const dashboard = new StageDashboardPage(page);
    if (!/dashboard/i.test(page.url())) {
      await safeGoto(page, new URL('/dashboard', baseUrl).toString());
    }
    await dashboard.assertDashboardStable();
    await assertAuthenticatedDashboard(page, workerLabel);
    await page.context().storageState({ path: storagePath });
    authenticatedOnCurrentPage = true;
    logger.info(`${workerLabel}: saved auth state to ${path.basename(storagePath)}`);
  });

  if (authenticatedOnCurrentPage) {
    await assertAuthenticatedDashboard(page, workerLabel);
    return page;
  }

  if (!(await tryRestoreDashboardSession(page, baseUrl, workerLabel))) {
    throw new Error(`${workerLabel}: unable to establish authenticated dashboard session.`);
  }

  return page;
}

module.exports = { bootstrapProdSession, assertAuthenticatedDashboard };

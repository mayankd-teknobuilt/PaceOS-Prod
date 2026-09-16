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

  for (const route of ['/dashboard', '/my-work']) {
    await page.goto(new URL(route, baseUrl).toString(), { waitUntil: 'domcontentloaded' });
    await dismissCookieBanner(page);

    if (await isLoginVisible(page)) {
      return false;
    }

    if (/dashboard/i.test(page.url()) && (await hasValidSession(page)) && (await isProjectContextSet(page))) {
      await dashboard.waitForDashboardReady();
      await assertAuthenticatedDashboard(page, workerLabel);
      logger.info(`${workerLabel}: reused saved auth session`);
      return true;
    }
  }

  return false;
}

/**
 * Each worker keeps its own storage file so parallel logins do not overwrite
 * other workers' sessions. Login is serialized with a file lock.
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
    await dashboard.returnToDashboard();
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

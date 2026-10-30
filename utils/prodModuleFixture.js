const path = require('path');
const { loadProdEnv } = require('./loadEnv');
loadProdEnv(path.resolve(__dirname, '..'));

const { test: base, expect } = require('@playwright/test');
const StageDashboardPage = require('../pages/StageDashboardPage');
const { createErrorMonitor } = require('./moduleErrorMonitor');
const { ensureWorkerAuthStorage, authStorageExists } = require('./authStorage');
const { bootstrapProdSession } = require('./prodSessionBootstrap');
const logger = require('./logger');

/**
 * One browser context + page per worker. Each worker uses its own auth file
 * (credentials-worker-N.json) so parallel runs do not share/overwrite sessions.
 */
const test = base.extend({
  loginMethod: ['credentials', { option: true, scope: 'worker' }],

  errorMonitor: async ({}, use) => {
    await use(createErrorMonitor());
  },

  prodSession: [
    async ({ browser, loginMethod }, use, workerInfo) => {
      const baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
      }

      // After a worker process restart, Playwright may assign workerIndex > 0 even with --workers=1.
      // Reuse worker-0 auth so the rest of the CT suite does not re-login and hit SSO logout races.
      const workerIndex =
        workerInfo.config.workers === 1 ? 0 : workerInfo.workerIndex;
      if (!authStorageExists(loginMethod, workerIndex)) {
        throw new Error(
          `Missing auth storage for ${loginMethod}. Run tests once so global-setup creates .auth/${process.env.PACE_ENV || 'prod'}/ credentials.`
        );
      }

      const storagePath = ensureWorkerAuthStorage(loginMethod, workerIndex);
      const context = await browser.newContext({
        baseURL: baseUrl,
        storageState: storagePath,
        acceptDownloads: true
      });
      let page = await context.newPage();

      logger.info(
        `Worker ${workerIndex}: opening production session (${loginMethod}, ${path.basename(storagePath)})`
      );
      page = await bootstrapProdSession(page, loginMethod, baseUrl, workerIndex);

      await use({ context, page });
      await context.close();
    },
    { scope: 'worker' }
  ],

  context: async ({ prodSession }, use) => {
    await use(prodSession.context);
  },

  page: async ({ prodSession }, use) => {
    await use(prodSession.page);
  },

  dashboard: async ({ page }, use) => {
    const dashboardPage = new StageDashboardPage(page);
    await dashboardPage.dismissCookieBanner();
    await dashboardPage.waitForDashboardReady();
    await use(page);
  }
});

module.exports = { test, expect };

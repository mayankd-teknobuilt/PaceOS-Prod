const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

const { test: base, expect } = require('@playwright/test');
const StageDashboardPage = require('../pages/StageDashboardPage');
const { createErrorMonitor } = require('./moduleErrorMonitor');
const { getAuthStoragePath, authStorageExists } = require('./authStorage');
const { bootstrapProdSession } = require('./prodSessionBootstrap');
const logger = require('./logger');

/**
 * One browser context + page for the whole worker.
 * Login and project selection happen once; all module specs reuse the same session.
 *
 * loginMethod is an 'option' fixture: it comes from playwright.config.js's
 * project-level `use: { loginMethod: 'credentials' | 'badge' }` and lets the
 * same spec files run under either login method depending on which project
 * they're executed under.
 */
const test = base.extend({
 loginMethod: ['credentials', { option: true, scope: 'worker' }],

  errorMonitor: async ({}, use) => {
    await use(createErrorMonitor());
  },

  prodSession: [
    async ({ browser, loginMethod }, use) => {
      const baseUrl = process.env.BASE_URL;
      if (!baseUrl) {
        throw new Error('BASE_URL is missing. Check PACE-QA-Automation-prod/.env.local');
      }

      if (!authStorageExists(loginMethod)) {
        throw new Error(
          `Missing auth storage for ${loginMethod}. Global setup should create ${getAuthStoragePath(loginMethod)}`
        );
      }

      const context = await browser.newContext({
        baseURL: baseUrl,
        storageState: getAuthStoragePath(loginMethod),
        acceptDownloads: true
      });
      const page = await context.newPage();

      logger.info(`Opening shared production session from saved auth (method: ${loginMethod})`);
      await bootstrapProdSession(page, loginMethod, baseUrl);

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
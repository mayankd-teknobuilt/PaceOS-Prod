const path = require('path');
const { loadProdEnv } = require('./loadEnv');
const { applyControlTowerCiDefaults } = require('./ciControlTower');
loadProdEnv(path.resolve(__dirname, '..'));
applyControlTowerCiDefaults();

const { test: prodTest, expect } = require('./prodModuleFixture');
const ControlTowerNavigationPage = require('../pages/control-tower/ControlTowerNavigationPage');
const { createErrorMonitor } = require('./moduleErrorMonitor');
const logger = require('./logger');

/**
 * Worker-scoped Control Tower session:
 * - Reuses prod login + project context (prodModuleFixture)
 * - Opens Control Tower once per worker
 * - Keeps the CT tab open for every report in the run
 */
const test = prodTest.extend({
  controlTowerSession: [
    async ({ prodSession }, use, workerInfo) => {
      const { page, context } = prodSession;
      const errorMonitor = createErrorMonitor();
      const navigation = new ControlTowerNavigationPage(page);

      const configuredWorkers = Math.max(1, workerInfo.config.workers || 1);
      const workerIndex =
        workerInfo.config.workers === 1 ? 0 : workerInfo.workerIndex % configuredWorkers;

      logger.info(
        `Worker ${workerIndex}: opening Control Tower once (shared session, serial reports)`
      );
      await navigation.openControlTower(context, errorMonitor);

      await use({ navigation, errorMonitor, page, context });

      logger.info('Closing Control Tower at end of worker session');
      await navigation.closeControlTower();
    },
    { scope: 'worker', timeout: 300000 }
  ],

  controlTower: async ({ controlTowerSession }, use) => {
    await use(controlTowerSession);
  }
});

const ctCaseTimeoutFloorMs = Number(process.env.CT_CASE_TIMEOUT_MS) || 180000;
test.beforeEach(({ }, testInfo) => {
  testInfo.setTimeout(Math.max(testInfo.timeout, ctCaseTimeoutFloorMs));
});

module.exports = { test, expect };

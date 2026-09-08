const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env.local'),
  override: true
});

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
    async ({ prodSession }, use) => {
      const { page, context } = prodSession;
      const errorMonitor = createErrorMonitor();
      const navigation = new ControlTowerNavigationPage(page);

      logger.info('Opening Control Tower once for this worker (shared session)');
      await navigation.openControlTower(context, errorMonitor);

      await use({ navigation, errorMonitor, page, context });

      logger.info('Closing Control Tower at end of worker session');
      await navigation.closeControlTower();
    },
    { scope: 'worker' }
  ],

  controlTower: async ({ controlTowerSession }, use) => {
    await use(controlTowerSession);
  }
});

module.exports = { test, expect };

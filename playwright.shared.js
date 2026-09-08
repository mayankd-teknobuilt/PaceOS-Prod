const path = require('path');
const { isFastMode } = require('./utils/fastMode');
const { loadProdEnv } = require('./utils/loadEnv');

/**
 * Shared production Playwright options (no @playwright/test import here).
 */
function createProdPlaywrightConfig(baseDir, deviceUse = {}) {
  loadProdEnv(baseDir);

  process.env.PACE_TEST_ENV = 'prod';

  const fast = isFastMode();
  const defaultWorkers = Number(process.env.PLAYWRIGHT_WORKERS || process.env.WORKERS) || 4;
  const ctWorkers = Number(process.env.CT_WORKERS || defaultWorkers);
  const ciCtWorkers = Number(process.env.CI_CT_WORKERS || (process.env.CI ? 2 : ctWorkers));
  const jsonReportFile =
    process.env.PLAYWRIGHT_JSON_OUTPUT || 'report.json';
  const baseURL = process.env.BASE_URL;
  const runEachModuleSpecs = process.env.PACE_MODULE_EACH === 'true';

  const projectUse = {
    ...deviceUse,
    baseURL,
    storageState: undefined
  };

  const moduleTestIgnore = runEachModuleSpecs
    ? '**/prod-modules/all-modules.spec.js'
    : '**/prod-modules/All Modules/**/*.spec.js';

  return {
    globalSetup: path.join(baseDir, 'global-setup.js'),
    testDir: path.join(baseDir, 'tests'),
    workers: defaultWorkers,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: fast ? 0 : 1,
    timeout: 900000,

    reporter: fast
      ? [['list']]
      : [
          ['html', { outputFolder: path.join(baseDir, 'playwright-report'), open: 'never' }],
          ['list'],
          ['allure-playwright'],
          ['json', { outputFile: path.join(baseDir, 'test-results', jsonReportFile) }]
        ],

    use: {
      baseURL,
      trace: fast ? 'off' : 'retain-on-failure',
      screenshot: fast ? 'off' : 'only-on-failure',
      video: 'off',
      acceptDownloads: true,
      actionTimeout: fast ? 15000 : 10000,
      navigationTimeout: 60000,
      headless: process.env.PW_HEADED === 'true' ? false : process.env.CI ? true : !process.argv.includes('--headed')
    },

    projects: [
      {
        name: 'prod-modules-email',
        testMatch: '**/prod-modules/**/*.spec.js',
        testIgnore: moduleTestIgnore,
        grep: /@prod-modules/,
        fullyParallel: false,
        workers: 1,
        use: { ...projectUse, loginMethod: 'credentials' }
      },
      {
        name: 'prod-modules-badge',
        testMatch: '**/prod-modules/**/*.spec.js',
        testIgnore: moduleTestIgnore,
        grep: /@prod-modules/,
        fullyParallel: false,
        workers: 1,
        use: { ...projectUse, loginMethod: 'badge' }
      },
      {
        name: 'control-tower-reports-email',
        testMatch: '**/Control-tower-reports/**/*.spec.js',
        grep: /@prod-modules/,
        fullyParallel: process.env.CI ? false : true,
        workers: process.env.CI ? ciCtWorkers : ctWorkers,
        use: {
          ...projectUse,
          actionTimeout: fast ? 20000 : 20000,
          navigationTimeout: 60000,
          loginMethod: 'credentials'
        }
      },
      {
        name: 'control-tower-reports-badge',
        testMatch: '**/Control-tower-reports/**/*.spec.js',
        grep: /@prod-modules/,
        fullyParallel: true,
        workers: ctWorkers,
        use: {
          ...projectUse,
          actionTimeout: fast ? 20000 : 20000,
          navigationTimeout: 60000,
          loginMethod: 'badge'
        }
      }
    ]
  };
}

module.exports = { createProdPlaywrightConfig };

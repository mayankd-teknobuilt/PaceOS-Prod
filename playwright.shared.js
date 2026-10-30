const path = require('path');
const { isFastMode } = require('./utils/fastMode');
const { loadProdEnv } = require('./utils/loadEnv');
const { CASE_TIMEOUT_MS } = require('./utils/testTiming');
const { getPlaywrightEnvGrep, combineGrepPatterns } = require('./utils/envTestFilter');

/**
 * Shared production Playwright options (no @playwright/test import here).
 */
function createProdPlaywrightConfig(baseDir, deviceUse = {}) {
  loadProdEnv(baseDir);

  const fast = isFastMode();
  const defaultWorkers = Number(process.env.PLAYWRIGHT_WORKERS || process.env.WORKERS) || 4;
  const jsonReportFile =
    process.env.PLAYWRIGHT_JSON_OUTPUT || 'report.json';
  const baseURL = process.env.BASE_URL;
  const envGrep = getPlaywrightEnvGrep();
  const suiteGrep = combineGrepPatterns(/@prod-modules/, envGrep);

  const projectUse = {
    ...deviceUse,
    baseURL,
    storageState: undefined
  };

  return {
    globalSetup: path.join(baseDir, 'global-setup.js'),
    testDir: path.join(baseDir, 'tests'),
    workers: defaultWorkers,
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    timeout: CASE_TIMEOUT_MS,

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
        grep: suiteGrep,
        fullyParallel: true,
        use: { ...projectUse, loginMethod: 'credentials' }
      },
      {
        name: 'prod-modules-badge',
        testMatch: '**/prod-modules/**/*.spec.js',
        grep: suiteGrep,
        fullyParallel: true,
        use: { ...projectUse, loginMethod: 'badge' }
      },
      {
        name: 'control-tower-reports-email',
        testMatch: '**/Control-tower-reports/reports/**/*.spec.js',
        grep: suiteGrep,
        fullyParallel: true,
        use: {
          ...projectUse,
          actionTimeout: fast ? 20000 : 20000,
          navigationTimeout: 60000,
          loginMethod: 'credentials'
        }
      },
      {
        name: 'control-tower-reports-badge',
        testMatch: '**/Control-tower-reports/reports/**/*.spec.js',
        grep: suiteGrep,
        fullyParallel: true,
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

const {
  buildReportTestCases,
  buildAllReportTestCases,
  splitIntoWorkerBatches
} = require('./controlTowerParallel');
const logger = require('./logger');

const REPORT_ATTEMPTS = 2;

async function runSetupSteps(reportsPage, setupSteps, errorMonitor) {
  for (const step of setupSteps) {
    errorMonitor.reset();
    await reportsPage.executeStep(step, { setup: true });
    await reportsPage.assertSetupClean(errorMonitor);
  }
}

async function runReportBody(testCase, { navigation, errorMonitor, test }) {
  const { reportsPage } = navigation;
  await reportsPage.ensureControlTowerTabActive();

  if (testCase.setupSteps.length) {
    await test.step(`Setup: ${testCase.reportName}`, async () => {
      await runSetupSteps(reportsPage, testCase.setupSteps, errorMonitor);
    });
  }

  errorMonitor.reset();
  await reportsPage.executeStep(testCase.reportStep, { setup: false });

  if (testCase.reportStep.type === 'report') {
    await reportsPage.assertDownloadBehavior(testCase.reportName);
  }

  await reportsPage.assertStepClean(errorMonitor);
}

/**
 * Run one report with a single retry. On final failure, log a failed step in the
 * report but return the error so the batch can continue.
 */
async function runReportWithRetry(testCase, { navigation, errorMonitor, test }) {
  let lastError = null;

  for (let attempt = 1; attempt <= REPORT_ATTEMPTS; attempt++) {
    const stepLabel =
      attempt === 1 ? testCase.reportName : `${testCase.reportName} (retry)`;

    try {
      await test.step(stepLabel, async () => {
        await runReportBody(testCase, { navigation, errorMonitor, test });
      });
      return null;
    } catch (error) {
      lastError = error;
      logger.warn(
        `Report "${testCase.reportName}" attempt ${attempt}/${REPORT_ATTEMPTS} failed: ${error.message}`
      );

      if (attempt < REPORT_ATTEMPTS) {
        await navigation.reportsPage.ensureControlTowerTabActive();
        await navigation.reportsPage.waitForReportSettle({ quick: true });
      }
    }
  }

  await test
    .step(`${testCase.reportName} — FAILED after retry`, async () => {
      throw lastError;
    })
    .catch(() => {});

  return {
    reportName: testCase.reportName,
    categoryName: testCase.categoryName,
    error: lastError
  };
}

async function runReportsBatch(testCases, { controlTower, test }) {
  const failures = [];

  for (const testCase of testCases) {
    const failure = await runReportWithRetry(testCase, {
      navigation: controlTower.navigation,
      errorMonitor: controlTower.errorMonitor,
      test
    });

    if (failure) {
      failures.push(failure);
    }
  }

  if (failures.length) {
    const summary = failures
      .map(
        failure =>
          `  - [${failure.categoryName}] ${failure.reportName}: ${failure.error.message}`
      )
      .join('\n');

    throw new Error(`${failures.length} report(s) failed after retry:\n${summary}`);
  }
}

/**
 * Run every report in a category inside an already-open Control Tower session.
 */
async function runCategoryInSession(category, { controlTower, test }) {
  if (category.prodEnabled === false) {
    return;
  }

  const cases = buildReportTestCases(category);

  await test.step(category.name, async () => {
    await runReportsBatch(cases, { controlTower, test });
  });
}

/**
 * Run all enabled categories in one Control Tower session (login + CT open once).
 */
async function runAllReportsInSession({ controlTower, test }) {
  const { categories } = require('../testdata/control-tower');

  for (const category of categories) {
    await runCategoryInSession(category, { controlTower, test });
  }
}

/**
 * One test per category — all reports sequential, CT tab stays open between reports.
 */
function registerCategorySessionTest(test, category) {
  if (category.prodEnabled === false) {
    test.describe.skip(`@prod-modules Control Tower - ${category.name}`, () => {
      test('not available on production Control Tower', () => {});
    });
    return;
  }

  const cases = buildReportTestCases(category);

  test.describe.configure({ mode: 'serial' });

  test.describe(`@prod-modules Control Tower - ${category.name}`, () => {
    test(`navigate all ${category.name} reports`, async ({ controlTower }) => {
      test.setTimeout(900000);

      await test.step(category.name, async () => {
        await runReportsBatch(cases, { controlTower, test });
      });
    });
  });
}

/**
 * Split all reports across parallel workers. Each worker logs in once and opens
 * Control Tower once, then runs its batch with per-report retry.
 */
function registerAllReportsSessionTest(test, { workers = 4 } = {}) {
  const allCases = buildAllReportTestCases();
  const batches = splitIntoWorkerBatches(allCases, workers);

  test.describe.configure({ mode: 'parallel' });

  test.describe('@prod-modules Control Tower Reports', () => {
    batches.forEach((batch, index) => {
      test(`batch ${index + 1} — ${batch.length} reports`, async ({ controlTower }) => {
        test.setTimeout(900000);
        await runReportsBatch(batch, { controlTower, test });
      });
    });
  });
}

module.exports = {
  runSetupSteps,
  runReportBody,
  runReportWithRetry,
  runReportsBatch,
  runCategoryInSession,
  runAllReportsInSession,
  registerCategorySessionTest,
  registerAllReportsSessionTest,
  buildReportTestCases,
  buildAllReportTestCases
};

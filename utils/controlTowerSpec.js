const { buildReportTestCases } = require('./controlTowerParallel');
const { isCategoryEnabledForEnv, getCategoryEnvScopeTag } = require('./paceEnv');
const {
  REPORT_ATTEMPTS,
  getCaseTimeoutMs,
  getCaseAttemptMs,
  attemptBudgetMs,
  remainingMs
} = require('./testTiming');
const logger = require('./logger');

async function runWithAttemptBudget(fn, deadlineMs, label, attemptCapMs) {
  const budgetMs = attemptBudgetMs(deadlineMs, attemptCapMs);
  if (budgetMs <= 0) {
    throw new Error(`${label} skipped — case time budget exhausted.`);
  }

  let timeoutId;
  try {
    return await Promise.race([
      fn(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`${label} timed out after ${budgetMs}ms`));
        }, budgetMs);
      })
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

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

async function runReportWithRetry(testCase, { navigation, errorMonitor, test }) {
  let lastError = null;
  const attemptCapMs = getCaseAttemptMs(testCase.reportName);
  const deadlineMs = Date.now() + getCaseTimeoutMs(testCase.reportName);

  for (let attempt = 1; attempt <= REPORT_ATTEMPTS; attempt++) {
    if (remainingMs(deadlineMs) <= 0) {
      break;
    }

    const stepLabel =
      attempt === 1 ? testCase.reportName : `${testCase.reportName} (retry)`;

    try {
      await test.step(stepLabel, async () => {
        await runWithAttemptBudget(
          () => runReportBody(testCase, { navigation, errorMonitor, test }),
          deadlineMs,
          stepLabel,
          attemptCapMs
        );
      });
      return null;
    } catch (error) {
      lastError = error;
      logger.warn(
        `Report "${testCase.reportName}" attempt ${attempt}/${REPORT_ATTEMPTS} failed: ${error.message}`
      );

      if (attempt < REPORT_ATTEMPTS && remainingMs(deadlineMs) > 0) {
        try {
          await navigation.reportsPage.ensureControlTowerTabActive();
        } catch (recoverErr) {
          logger.warn(`Control Tower tab recovery before retry: ${recoverErr.message}`);
          await navigation.openControlTower(navigation.dashboardPage.context(), errorMonitor);
        }
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

function registerSingleReportTest(test, category, reportName) {
  const cases = buildReportTestCases(category);
  const testCase = cases.find(item => item.reportName === reportName);
  const scopeTag = getCategoryEnvScopeTag(category);
  const titlePrefix = `${scopeTag} @prod-modules Control Tower - ${category.name} - ${reportName}`;

  if (!isCategoryEnabledForEnv(category)) {
    test.describe(titlePrefix, () => {
      test.skip(true, 'Report category not configured for PACE_ENV');
    });
    return;
  }

  if (!testCase) {
    throw new Error(`Report "${reportName}" not found in category "${category.slug}"`);
  }

  test.describe(titlePrefix, () => {
    if (process.env.CI === 'true') {
      test.describe.configure({ mode: 'serial' });
    }

    test('opens and loads without application errors', async ({ controlTower }) => {
      test.setTimeout(getCaseTimeoutMs(reportName));
      const failure = await runReportWithRetry(testCase, {
        navigation: controlTower.navigation,
        errorMonitor: controlTower.errorMonitor,
        test
      });

      if (failure) {
        throw failure.error;
      }
    });
  });
}

module.exports = {
  runReportWithRetry,
  registerSingleReportTest,
  buildReportTestCases
};

const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const OnsiteWorkExecutionPage = require('../../../pages/modules/onsite-work-execution');

test.describe('@pace-env-prod @prod-modules Onsite Work Execution', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Onsite Work Execution'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new OnsiteWorkExecutionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

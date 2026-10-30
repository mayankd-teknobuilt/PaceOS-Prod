const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const OwnerProductivityEstimatePage = require('../../../pages/modules/owner-productivity-estimate');

test.describe('@pace-env-dev3 @prod-modules Owner Productivity Estimate', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Owner Productivity Estimate'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new OwnerProductivityEstimatePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

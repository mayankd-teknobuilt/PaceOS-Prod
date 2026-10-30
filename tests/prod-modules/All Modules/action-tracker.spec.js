const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ActionTrackerPage = require('../../../pages/modules/action-tracker');

test.describe('@pace-env-all @prod-modules Action Tracker', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Action Tracker'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ActionTrackerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

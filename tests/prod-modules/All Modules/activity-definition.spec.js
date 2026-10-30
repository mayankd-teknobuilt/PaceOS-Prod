const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ActivityDefinitionPage = require('../../../pages/modules/activity-definition');

test.describe('@pace-env-dev3 @prod-modules Activity Definition', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Activity Definition'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ActivityDefinitionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

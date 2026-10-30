const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ActivityToCrewCompositionPage = require('../../../pages/modules/activity-to-crew-composition');

test.describe('@pace-env-dev3 @prod-modules Activity To Crew Composition', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Activity To Crew Composition'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ActivityToCrewCompositionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

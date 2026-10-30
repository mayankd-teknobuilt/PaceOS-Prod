const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ObservationAndInterventionPage = require('../../../pages/modules/observation-and-intervention');

test.describe('@pace-env-prod @prod-modules Observation and Intervention', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Observation and Intervention'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ObservationAndInterventionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

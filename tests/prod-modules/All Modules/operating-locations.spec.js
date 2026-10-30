const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const OperatingLocationsPage = require('../../../pages/modules/operating-locations');

test.describe('@pace-env-all @prod-modules Operating-locations', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Operating-locations'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new OperatingLocationsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const HeatTracePage = require('../../../pages/modules/heat-trace');

test.describe('@pace-env-prod @prod-modules Heat Trace', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Heat Trace'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new HeatTracePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

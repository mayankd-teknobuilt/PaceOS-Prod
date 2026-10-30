const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const GeoPlotManagerPage = require('../../../pages/modules/geo-plot-manager');

test.describe('@pace-env-dev3 @prod-modules Geo Plot Manager', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Geo Plot Manager'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new GeoPlotManagerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

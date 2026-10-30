const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const GeoPlotRadarPage = require('../../../pages/modules/geo-plot-radar');

test.describe('@pace-env-dev3 @prod-modules Geo Plot Radar', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Geo Plot Radar'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new GeoPlotRadarPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

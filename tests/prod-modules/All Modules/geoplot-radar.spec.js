const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const GeoplotRadarPage = require('../../../pages/modules/geoplot-radar');

test.describe('@pace-env-prod @prod-modules Geoplot Radar', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Geoplot Radar'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new GeoplotRadarPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

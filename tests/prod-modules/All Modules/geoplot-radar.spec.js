const { test } = require('../../../utils/prodModuleFixture');
const GeoplotRadarPage = require('../../../pages/modules/geoplot-radar');

test.describe('@prod-modules Geoplot Radar', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new GeoplotRadarPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

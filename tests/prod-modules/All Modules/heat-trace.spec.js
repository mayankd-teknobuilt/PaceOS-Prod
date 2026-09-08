const { test } = require('../../../utils/prodModuleFixture');
const HeatTracePage = require('../../../pages/modules/heat-trace');

test.describe('@prod-modules Heat Trace', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new HeatTracePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

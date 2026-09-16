const { test } = require('../../../utils/prodModuleFixture');
const McdermottPowerbiPage = require('../../../pages/modules/mcdermott-powerbi');

test.describe('@prod-modules McDermott PowerBI', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new McdermottPowerbiPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

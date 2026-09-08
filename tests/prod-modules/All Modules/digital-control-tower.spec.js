const { test } = require('../../../utils/prodModuleFixture');
const DigitalControlTowerPage = require('../../../pages/modules/digital-control-tower');

test.describe('@prod-modules Digital Control Tower', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new DigitalControlTowerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

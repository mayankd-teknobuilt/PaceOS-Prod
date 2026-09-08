const { test } = require('../../../utils/prodModuleFixture');
const HsePlusControlTowerPage = require('../../../pages/modules/hse-plus-control-tower');

test.describe('@prod-modules HSE Plus Control Tower', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new HsePlusControlTowerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

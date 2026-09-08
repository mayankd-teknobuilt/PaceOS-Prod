const { test } = require('../../../utils/prodModuleFixture');
const PreStartPage = require('../../../pages/modules/pre-start');

test.describe('@prod-modules Pre-Start', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new PreStartPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

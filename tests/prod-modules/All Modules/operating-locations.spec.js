const { test } = require('../../../utils/prodModuleFixture');
const OperatingLocationsPage = require('../../../pages/modules/operating-locations');

test.describe('@prod-modules Operating-locations', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new OperatingLocationsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

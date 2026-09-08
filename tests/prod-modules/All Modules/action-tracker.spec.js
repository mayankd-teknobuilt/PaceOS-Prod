const { test } = require('../../../utils/prodModuleFixture');
const ActionTrackerPage = require('../../../pages/modules/action-tracker');

test.describe('@prod-modules Action Tracker', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new ActionTrackerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

const { test } = require('../../../utils/prodModuleFixture');
const SubscriptionsPage = require('../../../pages/modules/subscriptions');

test.describe('@prod-modules Subscriptions', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new SubscriptionsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

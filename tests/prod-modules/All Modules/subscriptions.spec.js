const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const SubscriptionsPage = require('../../../pages/modules/subscriptions');

test.describe('@pace-env-all @prod-modules Subscriptions', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Subscriptions'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new SubscriptionsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

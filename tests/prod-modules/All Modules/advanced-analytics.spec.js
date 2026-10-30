const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const AdvancedAnalyticsPage = require('../../../pages/modules/advanced-analytics');

test.describe('@pace-env-dev3 @prod-modules Advanced Analytics', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Advanced Analytics'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new AdvancedAnalyticsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

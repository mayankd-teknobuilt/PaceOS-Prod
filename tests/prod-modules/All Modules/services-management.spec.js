const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ServicesManagementPage = require('../../../pages/modules/services-management');

test.describe('@pace-env-dev3 @prod-modules Services Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Services Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ServicesManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

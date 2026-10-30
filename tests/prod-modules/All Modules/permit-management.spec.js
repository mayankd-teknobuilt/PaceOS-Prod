const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const PermitManagementPage = require('../../../pages/modules/permit-management');

test.describe('@pace-env-dev3 @prod-modules Permit Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Permit Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new PermitManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

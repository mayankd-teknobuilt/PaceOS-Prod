const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const MasterAssetManagementPage = require('../../../pages/modules/master-asset-management');

test.describe('@pace-env-dev3 @prod-modules Master Asset Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Master Asset Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new MasterAssetManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

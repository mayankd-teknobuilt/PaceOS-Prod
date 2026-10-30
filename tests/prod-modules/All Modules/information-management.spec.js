const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const InformationManagementPage = require('../../../pages/modules/information-management');

test.describe('@pace-env-dev3 @prod-modules Information Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Information Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new InformationManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

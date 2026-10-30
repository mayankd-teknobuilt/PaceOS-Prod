const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ConstructionWorkPackagePage = require('../../../pages/modules/construction-work-package');

test.describe('@pace-env-dev3 @prod-modules Construction Work Package', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Construction Work Package'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ConstructionWorkPackagePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

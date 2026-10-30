const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const EngineeringWorkPackagePage = require('../../../pages/modules/engineering-work-package');

test.describe('@pace-env-dev3 @prod-modules Engineering Work Package', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Engineering Work Package'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new EngineeringWorkPackagePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

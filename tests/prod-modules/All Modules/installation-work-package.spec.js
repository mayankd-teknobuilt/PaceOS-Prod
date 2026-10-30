const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const InstallationWorkPackagePage = require('../../../pages/modules/installation-work-package');

test.describe('@pace-env-dev3 @prod-modules Installation Work Package', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Installation Work Package'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new InstallationWorkPackagePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

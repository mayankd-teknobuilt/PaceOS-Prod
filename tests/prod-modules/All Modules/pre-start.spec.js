const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const PreStartPage = require('../../../pages/modules/pre-start');

test.describe('@pace-env-prod @prod-modules Pre-Start', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Pre-Start'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new PreStartPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

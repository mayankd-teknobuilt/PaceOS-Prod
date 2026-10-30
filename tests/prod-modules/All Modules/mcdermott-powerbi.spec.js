const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const McdermottPowerbiPage = require('../../../pages/modules/mcdermott-powerbi');

test.describe('@pace-env-prod @prod-modules McDermott PowerBI', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('McDermott PowerBI'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new McdermottPowerbiPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const ApeDigitalControlTowerPage = require('../../../pages/modules/ape-digital-control-tower');

test.describe('@pace-env-dev3 @prod-modules APE Digital Control Tower', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('APE Digital Control Tower'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new ApeDigitalControlTowerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

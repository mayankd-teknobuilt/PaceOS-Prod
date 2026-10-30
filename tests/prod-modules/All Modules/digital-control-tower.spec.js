const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const DigitalControlTowerPage = require('../../../pages/modules/digital-control-tower');

test.describe('@pace-env-all @prod-modules Digital Control Tower', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Digital Control Tower'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new DigitalControlTowerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

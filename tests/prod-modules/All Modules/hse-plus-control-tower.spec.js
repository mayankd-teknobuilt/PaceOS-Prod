const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const HsePlusControlTowerPage = require('../../../pages/modules/hse-plus-control-tower');

test.describe('@pace-env-prod @prod-modules HSE Plus Control Tower', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('HSE Plus Control Tower'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new HsePlusControlTowerPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

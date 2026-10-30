const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const Module4dViewPage = require('../../../pages/modules/4d-view');

test.describe('@pace-env-dev3 @prod-modules 4D View', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('4D View'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new Module4dViewPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

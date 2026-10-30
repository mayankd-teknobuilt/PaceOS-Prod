const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const Module3dViewPage = require('../../../pages/modules/3d-view');

test.describe('@pace-env-dev3 @prod-modules 3D View', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('3D View'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new Module3dViewPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

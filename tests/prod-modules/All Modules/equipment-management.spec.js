const { test } = require('../../../utils/prodModuleFixture');
const { isModuleEnabledForEnv } = require('../../../testdata/stageModules');
const EquipmentManagementPage = require('../../../pages/modules/equipment-management');

test.describe('@pace-env-all @prod-modules Equipment Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.skip(!isModuleEnabledForEnv('Equipment Management'), 'Module not configured for PACE_ENV');
    test.setTimeout(90000);
    await new EquipmentManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

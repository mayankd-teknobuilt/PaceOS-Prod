const { test } = require('../../../utils/prodModuleFixture');
const EquipmentManagementPage = require('../../../pages/modules/equipment-management');

test.describe('@prod-modules Equipment Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new EquipmentManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

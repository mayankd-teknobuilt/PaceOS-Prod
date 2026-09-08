const { test } = require('../../../utils/prodModuleFixture');
const DepartmentsPage = require('../../../pages/modules/departments');

test.describe('@prod-modules Departments', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new DepartmentsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

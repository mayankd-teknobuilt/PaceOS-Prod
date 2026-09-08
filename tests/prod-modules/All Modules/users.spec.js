const { test } = require('../../../utils/prodModuleFixture');
const UsersPage = require('../../../pages/modules/users');

test.describe('@prod-modules Users', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new UsersPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

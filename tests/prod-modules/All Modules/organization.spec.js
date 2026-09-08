const { test } = require('../../../utils/prodModuleFixture');
const OrganizationPage = require('../../../pages/modules/organization');

test.describe('@prod-modules Organization', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new OrganizationPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

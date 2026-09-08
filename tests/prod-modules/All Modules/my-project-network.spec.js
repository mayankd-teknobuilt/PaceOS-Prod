const { test } = require('../../../utils/prodModuleFixture');
const MyProjectNetworkPage = require('../../../pages/modules/my-project-network');

test.describe('@prod-modules My Project Network', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new MyProjectNetworkPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

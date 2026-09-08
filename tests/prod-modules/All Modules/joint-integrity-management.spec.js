const { test } = require('../../../utils/prodModuleFixture');
const JointIntegrityManagementPage = require('../../../pages/modules/joint-integrity-management');

test.describe('@prod-modules Joint Integrity Management', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new JointIntegrityManagementPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

const { test } = require('../../../utils/prodModuleFixture');
const AuditsCompliancePage = require('../../../pages/modules/audits-compliance');

test.describe('@prod-modules Audits / Compliance', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new AuditsCompliancePage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

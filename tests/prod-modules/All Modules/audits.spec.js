const { test } = require('../../../utils/prodModuleFixture');
const AuditsPage = require('../../../pages/modules/audits');

test.describe('@prod-modules Audits', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new AuditsPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

const { test } = require('../../../utils/prodModuleFixture');
const OnsiteWorkExecutionPage = require('../../../pages/modules/onsite-work-execution');

test.describe('@prod-modules Onsite Work Execution', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new OnsiteWorkExecutionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

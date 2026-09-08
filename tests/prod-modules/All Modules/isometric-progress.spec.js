const { test } = require('../../../utils/prodModuleFixture');
const IsometricProgressPage = require('../../../pages/modules/isometric-progress');

test.describe('@prod-modules Isometric Progress', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new IsometricProgressPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

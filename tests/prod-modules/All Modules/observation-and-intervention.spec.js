const { test } = require('../../../utils/prodModuleFixture');
const ObservationAndInterventionPage = require('../../../pages/modules/observation-and-intervention');

test.describe('@prod-modules Observation and Intervention', () => {
  test('opens and loads without application errors', async ({ dashboard, context, errorMonitor }) => {
    test.setTimeout(180000);
    await new ObservationAndInterventionPage(dashboard).runOpenLoadCheck(context, errorMonitor);
  });
});

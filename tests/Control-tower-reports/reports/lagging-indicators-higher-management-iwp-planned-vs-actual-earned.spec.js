const { test } = require('../../../utils/controlTowerFixture');
const { registerSingleReportTest } = require('../../../utils/controlTowerSpec');
const category = require('../../../testdata/control-tower/lagging-indicators');

registerSingleReportTest(test, category, "Higher Management — IWP Planned vs. Actual Earned");
